import { useWallets } from "@/app/hooks";
import { useEffect, useState } from "react";
import { boringVaultAddress } from "../constants/contracts";
import { NucleusTransaction, RawNucleusTransaction } from "../types";

/**
 * Hook to fetch and manage Nucleus transactions for the connected wallet
 *
 * @returns An object containing:
 * - transactions: Array of NucleusTransaction objects for the connected wallet
 * - isLoading: Boolean indicating if transactions are being fetched
 * - error: Error message string if the fetch failed, null otherwise
 *
 * @remarks
 * - Fetches transactions from the Nucleus API for pending, fulfilled, and cancelled statuses
 * - Only returns transactions matching the connected EVM wallet address
 * - Automatically refetches when the wallet address changes
 * - Uses the NUCLEUS_API_URL environment variable for the API endpoint
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { transactions, isLoading, error } = useTransactions();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {transactions.map(tx => (
 *         <div key={tx.id}>{tx.status}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTransactions() {
  // Hooks
  const { evmWallet } = useWallets();

  // State
  const [transactions, setTransactions] = useState<NucleusTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const evmAddress = evmWallet?.address as `0x${string}` | undefined;

  // Fetch data
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_NUCLEUS_API_URL || "";
        const method = "unfulfilled";
        const chainId = 1;
        const statuses = ["pending", "fulfilled", "cancelled"];

        // Concatenate all transactions from all statuses, filter by the connected wallet address, and sort by creation date
        // The result is a flat list of the all the user's transactions
        const transactions = (
          await Promise.all(
            statuses.map(async (status) => {
              const apiUrl = `${baseUrl}/${method}?vaultAddress=${boringVaultAddress}&chainId=${chainId}&status=${status}`;
              const responseAsJson = await fetch(apiUrl);
              const response = (await responseAsJson.json()).data as RawNucleusTransaction[];
              return response
                .map(convertRawTransactionToTransaction)
                .filter((tx) => tx.user === evmAddress)
                .sort((a, b) => Number(b.createdTimestamp) - Number(a.createdTimestamp));
            })
          )
        ).flat();

        setTransactions(transactions);
      } catch (error) {
        setError(error as string);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [evmAddress]);

  return { transactions, isLoading, error };
}

// Converts the snake case fields from the nucleus API to camel case
function convertRawTransactionToTransaction(raw: RawNucleusTransaction): NucleusTransaction {
  return {
    id: raw.id,
    user: raw.user,
    offerToken: raw.offer_token,
    wantToken: raw.want_token,
    amount: raw.amount,
    deadline: raw.deadline,
    atomicPrice: raw.atomic_price,
    createdTimestamp: raw.created_timestamp,
    endingTimestamp: raw.ending_timestamp,
    createdLogIndex: raw.created_log_index,
    createdTransactionIndex: raw.created_transaction_index,
    createdBlockNumber: raw.created_block_number,
    endingLogIndex: raw.ending_log_index,
    endingTransactionIndex: raw.ending_transaction_index,
    endingBlockNumber: raw.ending_block_number,
    status: raw.status,
    queueAddress: raw.queue_address,
    chainId: raw.chain_id,
    offerAmountSpent: raw.offer_amount_spent,
    wantAmountRec: raw.want_amount_rec,
    createdTransactionHash: raw.created_transaction_hash,
    endingTransactionHash: raw.ending_transaction_hash,
  };
}
