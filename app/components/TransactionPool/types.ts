import { PublicKey } from '@solana/web3.js';
import { WithdrawObject } from "@/lib/withdrawUtils"

export interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed';
  eclipseTxHash: string | null;
  pdaData: any | undefined;
  pda: PublicKey | null
}

export const defaultTransaction: Transaction = {
    hash: "",
    status: 'pending',
    eclipseTxHash: null,
    pdaData: undefined,
    pda: null
};


export interface WithdrawActivity {
  amount: string,
  pda: string,
  transaction: any,
} 

export interface TransactionContextType {
  transactions: Map<string, Transaction>;
  withdrawTransactions: Map<BigInt, WithdrawActivity>;
  addTransactionListener: (txHash: string, l1Status: string) => void;
  getTransaction: (txHash: string) => Transaction | undefined;
  pendingTransactions: Transaction[];
  deposits: any[] | null
  withdrawals: WithdrawObject[] | null;
  addNewDeposit: (txData: any) => void;
  setWithdrawals: React.Dispatch<React.SetStateAction<any[]>>;
}
