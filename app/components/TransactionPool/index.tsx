"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLastDeposits, getNonce, getEclipseTransaction, checkDepositWithPDA } from "@/lib/activityUtils"
import { Options, useNetwork } from "@/app/contexts/NetworkContext"; 
import { createPublicClient, PublicClient, http } from 'viem'
import { mainnet, sepolia } from "viem/chains";
import { Transaction, defaultTransaction, TransactionContextType, WithdrawActivity } from "./types"
import { useWallets } from '@/app/hooks/useWallets';
import { getWithdrawalsByAddress, WithdrawObject, getWithdrawalPda} from "@/lib/withdrawUtils"

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children } : { children: ReactNode}) => {
  const [transactions, setTransactions] = useState<Map<string, Transaction>>(new Map());
  const [withdrawTransactions, setWithdrawTransactions]= useState<Map<BigInt, WithdrawActivity>>(new Map());
  const [deposits, setDeposits] = useState<any[] | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[] | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [lastAddress, setLastAddress] = useState<string>(''); 
  const [viemClient, setClient] = useState<PublicClient | null>(null)
  const { selectedOption, contractAddress, bridgeProgram, eclipseRpc, withdrawApi } = useNetwork();

  const { evmWallet } = useWallets();
  const fetchDeposits = async () => {
    try {
      setDeposits([]);
      const data = await getLastDeposits(evmWallet?.address || '', (selectedOption === Options.Mainnet) ? "mainnet" : "testnet");
      setDeposits(data.reverse());

      const withdrawalsData = await getWithdrawalsByAddress(evmWallet?.address || '', withdrawApi); 
      setWithdrawals(withdrawalsData)
      withdrawalsData.forEach((item) => {
        addNewWithdrawal(item)
      });
      
     const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
     const processTransactions = async (data: any[]) => {
       data.forEach(async (tx, index) => {
         await delay(index * 30);
         addTransactionListener(tx.hash, tx.txreceipt_status);
      });
      };
      processTransactions(data);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    }
  };

  useEffect(() =>{
    const isMainnet = (selectedOption === Options.Mainnet);
    console.log("isMainnet", isMainnet)
    const client = createPublicClient({
      chain    : isMainnet ? mainnet : sepolia,
      transport: isMainnet 
        ? http("https://empty-responsive-patron.quiknode.pro/91dfa8475605dcdec9afdc8273578c9f349774a1/") 
        : http("https://sepolia.drpc.org"),
      cacheTime: 0
    })
    setClient(client);
    setPendingTransactions([]);
    fetchDeposits();
  }, [selectedOption])

  useEffect(() => {
    if (evmWallet?.address.startsWith("0x") && (evmWallet?.address !== lastAddress)) { 
      setLastAddress(evmWallet?.address);
      fetchDeposits();
    }
  }, [evmWallet?.address]);

  const addNewDeposit = (txData: any) => {
    setDeposits((prev: any) => [txData, ...prev]);
  }

  const addNewWithdrawal = async (withdrawal: WithdrawObject) => {
    const pda = await getWithdrawalPda(bridgeProgram, withdrawal[0].message.withdraw_id);
    const txHash = await getEclipseTransaction(pda, eclipseRpc);

    const newObject: WithdrawActivity = {
      amount: withdrawal[0].message.amount_wei,
      pda: pda?.toString() || '',
      transaction: txHash[0] 
    } 
    setWithdrawTransactions((prev) => new Map(prev.set(withdrawal[0].message.withdraw_id, newObject)));
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
      transport: isMainnet ? http() : http("https://sepolia.drpc.org"),
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
        withdrawTransactions
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
