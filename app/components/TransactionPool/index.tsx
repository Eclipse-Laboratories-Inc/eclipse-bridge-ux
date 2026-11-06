'use client';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

import { getLastDeposits, getNonce, getEclipseTransaction, checkDepositWithPDA, getWithdrawalTxFromArchive, WithdrawalTx } from "@/lib/activityUtils";
import { useNetwork } from "@/app/contexts/NetworkContext";
import { useWallets } from '@/app/hooks/useWallets';
import { getWithdrawalsByAddress, WithdrawObject, getWithdrawalPda } from "@/lib/withdrawUtils";
import { Options } from '@/lib/networkUtils';

import { createPublicClient, PublicClient, http } from 'viem';
import { mainnet, sepolia } from "viem/chains";

import { Transaction, defaultTransaction, TransactionContextType, WithdrawActivity } from "./types";

const ACTIVITY_POLL_MS = 60_000;
const AWAIT_WITHDRAWAL_POLL_MS = 15_000;
const AWAIT_WITHDRAWAL_MAX_MS = 10 * 60_000;

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children } : { children: ReactNode}) => {
  const [transactions, setTransactions] = useState<Map<string, Transaction>>(new Map());
  const [withdrawTransactions, setWithdrawTransactions]= useState<Map<BigInt, WithdrawActivity>>(new Map());
  const [deposits, setDeposits] = useState<any[] | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[] | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [lastAddress, setLastAddress] = useState<string>('');
  const [viemClient, setClient] = useState<PublicClient | null>(null)
  const { selectedOption, bridgeProgram, eclipseRpc, withdrawApi, legacyAddress } = useNetwork();

  const { evmWallet } = useWallets();

  // Bumped on every fetch so a slower, older response (previous network or
  // wallet, or a poll overtaken by a reset) can't overwrite newer state.
  const fetchIdRef = useRef(0);
  // Withdrawals whose Eclipse tx we've already looked up, so polls don't
  // repeat those RPC calls for every withdrawal.
  const knownWithdrawalIdsRef = useRef<Set<bigint>>(new Set());
  const resetGenRef = useRef(0);

  // reset: the network or wallet changed, so drop the old list.
  // Without reset (polling / after an action), merge so local-only state
  // survives until the APIs catch up: a just-sent deposit the indexer hasn't
  // seen yet, or a just-claimed withdrawal the API still reports as Pending.
  const fetchDeposits = async ({ reset }: { reset: boolean }) => {
    const fetchId = ++fetchIdRef.current;
    const isCurrent = () => fetchId === fetchIdRef.current;
    const resetGen = resetGenRef.current + (reset ? 1 : 0);
    const address = evmWallet?.address || '';
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    if (reset) {
      resetGenRef.current++;
      knownWithdrawalIdsRef.current = new Set();
      setDeposits([]);
      setWithdrawals([]);
    }

    let data: any[] = [];
    try {
      data = await getLastDeposits(address, (selectedOption === Options.Mainnet) ? "mainnet" : "testnet");
      if (!isCurrent()) return;
      setDeposits((prev) => {
        if (reset || !prev) return data;
        const fetchedHashes = new Set(data.map((tx) => tx.hash));
        return [...prev.filter((tx) => tx && !fetchedHashes.has(tx.hash)), ...data];
      });
    } catch (error) {
      console.log("failed to fetch deposits", error)
    }

    try {
      const withdrawalsData = await getWithdrawalsByAddress(address, withdrawApi, legacyAddress);
      if (!isCurrent()) return;
      setWithdrawals((prev) => {
        if (reset || !prev) return withdrawalsData;
        const closedIds = new Set(
          prev.filter((w) => w[1] === "Closed").map((w) => w[0].message.withdraw_id),
        );
        return withdrawalsData.map((w) =>
          closedIds.has(w[0].message.withdraw_id) ? [w[0], "Closed"] as WithdrawObject : w,
        );
      });
      const newWithdrawals = withdrawalsData.filter(
        (w) => !knownWithdrawalIdsRef.current.has(w[0].message.withdraw_id as bigint),
      );
      newWithdrawals.forEach((w) => knownWithdrawalIdsRef.current.add(w[0].message.withdraw_id as bigint));
      newWithdrawals.forEach(async (item, index) => {
        await delay(index * 300);
        // Only a reset (network/wallet change) makes this lookup irrelevant;
        // a newer poll won't redo it because the id is already marked known.
        if (resetGen !== resetGenRef.current) return;
        addNewWithdrawal(item);
      });
    } catch (error) {
      console.log("failed to fetch withdrawals", error)
    }

    data.forEach(async (tx, index) => {
      await delay(index * 300);
      addTransactionListener(tx.hash, tx.txreceipt_status);
    });
  };

  // Always points at the latest render's fetchDeposits, so the polling
  // interval doesn't call a closure with stale network/wallet values.
  const fetchDepositsRef = useRef(fetchDeposits);
  fetchDepositsRef.current = fetchDeposits;

  // Set after the user initiates a withdrawal: keep polling until the
  // withdraw API reports a withdrawal we didn't have, or we give up.
  const [awaitingWithdrawal, setAwaitingWithdrawal] = useState(false);
  const awaitingBaselineRef = useRef<Set<bigint>>(new Set());

  const refreshActivity = () => fetchDepositsRef.current({ reset: false });

  const trackNewWithdrawal = () => {
    awaitingBaselineRef.current = new Set(
      (withdrawals ?? []).map((w) => w[0].message.withdraw_id as bigint),
    );
    setAwaitingWithdrawal(true);
    refreshActivity();
  };

  useEffect(() => {
    if (!awaitingWithdrawal || !withdrawals) return;
    const appeared = withdrawals.some(
      (w) => !awaitingBaselineRef.current.has(w[0].message.withdraw_id as bigint),
    );
    if (appeared) setAwaitingWithdrawal(false);
  }, [withdrawals, awaitingWithdrawal]);

  useEffect(() => {
    if (!awaitingWithdrawal) return;
    const timeout = setTimeout(() => setAwaitingWithdrawal(false), AWAIT_WITHDRAWAL_MAX_MS);
    return () => clearTimeout(timeout);
  }, [awaitingWithdrawal]);

  // Poll while something is expected to change on its own: a withdrawal
  // in its fraud window (Processing -> Pending/"Claim Now"), or one the
  // user just initiated that the API hasn't indexed yet.
  const hasProcessingWithdrawal = withdrawals?.some((w) => w[1] === "Processing") ?? false;
  const shouldPoll = !!evmWallet?.address && (hasProcessingWithdrawal || awaitingWithdrawal);
  const pollMs = awaitingWithdrawal ? AWAIT_WITHDRAWAL_POLL_MS : ACTIVITY_POLL_MS;

  useEffect(() => {
    if (!shouldPoll) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchDepositsRef.current({ reset: false });
    }, pollMs);
    return () => clearInterval(interval);
  }, [shouldPoll, pollMs]);

  useEffect(() =>{
    const isMainnet = (selectedOption === Options.Mainnet);
    console.log("isMainnet", isMainnet)
    const client = createPublicClient({
      chain    : isMainnet ? mainnet : sepolia,
      transport: isMainnet
        ? http("https://empty-responsive-patron.quiknode.pro/91dfa8475605dcdec9afdc8273578c9f349774a1/")
        : http("https://ethereum-sepolia-rpc.publicnode.com"),
      cacheTime: 0
    })
    setClient(client);
    setPendingTransactions([]);
    setAwaitingWithdrawal(false);
    fetchDeposits({ reset: true });
  }, [selectedOption])

  useEffect(() => {
    if (evmWallet?.address.startsWith("0x") && (evmWallet?.address !== lastAddress)) {
      setLastAddress(evmWallet?.address);
      setAwaitingWithdrawal(false);
      fetchDeposits({ reset: true });
    }
  }, [evmWallet?.address]);

  const addNewDeposit = (txData: any) => {
    setDeposits((prev: any) => [txData, ...prev]);
  }

  const addNewWithdrawal = async (withdrawal: WithdrawObject) => {
    const withdrawId = withdrawal[0].message.withdraw_id as bigint;
    try {
      const pda = await getWithdrawalPda(bridgeProgram, withdrawId);
      const chain = selectedOption === Options.Mainnet ? "mainnet" : "testnet";

      // Prefer the archive route: the public RPC keeps only ~6 days of
      // history, so it has nothing for older withdrawals.
      const archived = await getWithdrawalTxFromArchive(withdrawId, chain);
      let transaction: WithdrawalTx | null;
      if (archived !== undefined) {
        transaction = archived;
        // The archive has full history, so "not found" means not indexed yet
        // (just sent): leave it unknown so the next fetch or poll retries.
        if (!transaction) knownWithdrawalIdsRef.current.delete(withdrawId);
      } else {
        // Route unavailable: public RPC. Empty here is final (pruned
        // history), so don't retry; the UI falls back to start_time.
        const signatures = await getEclipseTransaction(pda, eclipseRpc);
        transaction = signatures?.[0] ?? null;
      }

      const newObject: WithdrawActivity = {
        amount: withdrawal[0].message.amount_wei,
        pda: pda?.toString() || '',
        transaction
      }
      setWithdrawTransactions((prev) => new Map(prev).set(withdrawId, newObject));
    } catch (error) {
      // RPC failure: not marked as known, so the next fetch or poll retries.
      knownWithdrawalIdsRef.current.delete(withdrawId);
      console.log("failed to look up withdrawal tx", withdrawId.toString(), error);
    }
  }

  const addTransactionListener = (txHash: string, l1Status: string) => {
    if (transactions.has(txHash)) {
      return;
    }
    const newTransaction: Transaction = { hash: txHash, status: 'pending', pdaData: undefined, eclipseTxHash: null, pda: null};
    setTransactions((prev) => new Map(prev.set(txHash, newTransaction)));
    setPendingTransactions((prev) => [...prev, newTransaction]);

    checkTransactionStatus(txHash, l1Status);
  };

  const checkTransactionStatus = (txHash: string, l1Status: string) => {
    const isMainnet = (selectedOption === Options.Mainnet);
    const client = createPublicClient({
      chain    : isMainnet ? mainnet : sepolia,
      transport: isMainnet ? http() : http("https://ethereum-sepolia-rpc.publicnode.com"),
      cacheTime: 0
    })
    const fetchEclipseTx = async () => {
      const oldTx = transactions.get(txHash) ?? defaultTransaction;
      const pda     = oldTx.pda ?? await getNonce(client, txHash, bridgeProgram);
      const eclTx   = oldTx.eclipseTxHash ?? await getEclipseTransaction(pda, eclipseRpc);
      const pdaData = await checkDepositWithPDA(pda, eclipseRpc);

      const updatedTransaction: Transaction = {
        hash: txHash,
        status: pdaData ? "confirmed" : "pending",
        eclipseTxHash: eclTx && (eclTx.length > 0 ?  eclTx[0].signature : null),
        pdaData: pdaData,
        pda: pda ? pda : null
      };

      // update tx
      setTransactions((prev) => {
        const updated = new Map(prev);
        updated.set(txHash, updatedTransaction);
        return updated;
      });

      (pdaData || l1Status	=== "0" ) && setPendingTransactions((prev) =>
        prev.filter((tx) => tx.hash !== txHash)
      );
      if ((!pdaData || !eclTx) && (l1Status !== "0")) setTimeout(() => {fetchEclipseTx()}, 2000);
    };

    fetchEclipseTx();
  };

  const getTransaction = (txHash: string) => {
    return transactions.get(txHash);
  };

  return (
    <TransactionContext.Provider value={{
        transactions,
        withdrawals,
        addTransactionListener,
        getTransaction,
        pendingTransactions,
        deposits,
        addNewDeposit,
        withdrawTransactions,
        setWithdrawals,
        refreshActivity,
        trackNewWithdrawal
      }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
};
