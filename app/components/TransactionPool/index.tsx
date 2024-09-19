"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLastDeposits, getNonce, getEclipseTransaction, checkDepositWithPDA } from "@/lib/activityUtils"
import { createPublicClient, formatEther, http, parseEther, WalletClient } from 'viem'
import { mainnet, sepolia } from "viem/chains";
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import { Transaction, defaultTransaction, TransactionContextType } from "./types"

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children } : { children: ReactNode}) => {
  const [transactions, setTransactions] = useState<Map<string, Transaction>>(new Map());
  const [deposits, setDeposits] = useState<any[] | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [lastAddress, setLastAddress] = useState<string>(''); 

  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const evmWallet = userWallets.find(w => w.chain == "EVM");

  const client = createPublicClient({
    chain: (process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet") ? mainnet : sepolia,
    transport: (process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet") ? http() : http("https://sepolia.drpc.org"),
    cacheTime: 0
  })

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setDeposits([]);
        const data = await getLastDeposits(evmWallet?.address || '');
        setDeposits(data.reverse());
        
        data && data.map((tx: any, index: number) => {setTimeout(() => {addTransactionListener(tx.hash, tx.txreceipt_status)}, index * 0.1)})
      } catch (error) {
        console.error("Error fetching deposits:", error);
      }
    };
    if (evmWallet?.address.startsWith("0x") && (evmWallet?.address !== lastAddress)) { 
      setLastAddress(evmWallet?.address);
      fetchDeposits();
    }
  }, [evmWallet?.address]);

  const addNewDeposit = (txData: any) => {
    setDeposits((prev: any) => [txData, ...prev]);
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
    const fetchEclipseTx = async () => {
      const oldTx = transactions.get(txHash) ?? defaultTransaction;
      const pda     = oldTx.pda ?? await getNonce(client, txHash);   
      const eclTx   = oldTx.eclipseTxHash ?? await getEclipseTransaction(pda);  
      const pdaData = await checkDepositWithPDA(pda);  

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
        addTransactionListener, 
        getTransaction, 
        pendingTransactions,
        deposits,
        addNewDeposit
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

