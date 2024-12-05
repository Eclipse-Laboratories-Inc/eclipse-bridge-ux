export enum StepStatus {
  NOT_STARTED = "not-started",
  AWAITING_SIGNATURE = "awaiting-signature",
  LOADING = "loading",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface NucleusTransaction {
  id: number;
  user: string;
  offerToken: string;
  wantToken: string;
  amount: string;
  deadline: string;
  atomicPrice: string;
  createdTimestamp: string;
  endingTimestamp: string;
  createdLogIndex: number;
  createdTransactionIndex: number;
  createdBlockNumber: string;
  endingLogIndex: number;
  endingTransactionIndex: number;
  endingBlockNumber: string;
  status: string;
  queueAddress: string;
  chainId: number;
  offerAmountSpent: string;
  wantAmountRec: string;
  createdTransactionHash: string;
  endingTransactionHash: string;
}

export interface RawNucleusTransaction {
  id: number;
  user: string;
  offer_token: string;
  want_token: string;
  amount: string;
  deadline: string;
  atomic_price: string;
  created_timestamp: string;
  ending_timestamp: string;
  created_log_index: number;
  created_transaction_index: number;
  created_block_number: string;
  ending_log_index: number;
  ending_transaction_index: number;
  ending_block_number: string;
  status: string;
  queue_address: string;
  chain_id: number;
  offer_amount_spent: string;
  want_amount_rec: string;
  created_transaction_hash: string;
  ending_transaction_hash: string;
}
