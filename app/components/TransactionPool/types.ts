import { PublicKey } from '@solana/web3.js';

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

export interface TransactionContextType {
  transactions: Map<string, Transaction>;
  addTransactionListener: (txHash: string) => void;
  getTransaction: (txHash: string) => Transaction | undefined;
  pendingTransactions: Transaction[];
  deposits: any[] | null
  addNewDeposit: (txData: any) => void;
}
