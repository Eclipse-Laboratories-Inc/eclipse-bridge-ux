"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletClientContext } from "@/app/context"
import { getLastDeposits, getNonce, getEclipseTransaction, checkDepositWithPDA } from "@/lib/activityUtils"
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import { PublicKey } from '@solana/web3.js';

interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed';
  eclipseTxHash: string | null;
  pdaData: any | undefined;
  pda: PublicKey | null
}

const defaultTransaction: Transaction = {
    hash: "",
    status: 'pending',
    eclipseTxHash: null,
    pdaData: undefined,
    pda: null
};

interface TransactionContextType {
  transactions: Map<string, Transaction>;
  addTransactionListener: (txHash: string) => void;
  getTransaction: (txHash: string) => Transaction | undefined;
  pendingTransactions: Transaction[];
  deposits: any[] | null
  addNewDeposit: (txData: any) => void;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children } : { children: ReactNode}) => {
  const [transactions, setTransactions] = useState<Map<string, Transaction>>(new Map());
  const [deposits, setDeposits] = useState<any[] | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

  const walletClient = useContext(WalletClientContext);

  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const evmWallet = userWallets.find(w => w.chain == "EVM");

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const data = await getLastDeposits(evmWallet?.address || '');
        setDeposits(data.reverse());
        
        data && data.map((tx: any) => {addTransactionListener(tx.hash)})
      } catch (error) {
        console.error("Error fetching deposits:", error);
      }
    };

    fetchDeposits();
  }, [evmWallet]);

  const addNewDeposit = (txData: any) => {
    setDeposits((prev: any) => [...prev, txData]);
  }

  const addTransactionListener = (txHash: string) => {
    if (transactions.has(txHash)) {
      return;
    }
    const newTransaction: Transaction = { hash: txHash, status: 'pending', pdaData: undefined, eclipseTxHash: null, pda: null};
    setTransactions((prev) => new Map(prev.set(txHash, newTransaction)));
    setPendingTransactions((prev) => [...prev, newTransaction]);

    checkTransactionStatus(txHash);
  };
  
  const checkTransactionStatus = (txHash: string) => {
    const fetchEclipseTx = async () => {
      const oldTx = transactions.get(txHash) ?? defaultTransaction;

      const pda     = oldTx.pda ?? await getNonce(walletClient, txHash);   
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

      pdaData && setPendingTransactions((prev) =>
        prev.filter((tx) => tx.hash !== txHash)
      );
      if (!pdaData || !eclTx) setTimeout(() => {fetchEclipseTx()}, 2000);
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

