import { useWallets } from "@/app/hooks";
import { ISolana } from "@dynamic-labs/solana";
import { ProviderType } from "@hyperlane-xyz/sdk";
import { Connection } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { warpCore } from "../lib/warpcore";
import { StepStatus } from "../types";

export function useTokenTransfer() {
  const [transactionState, setTransactionState] = useState<StepStatus>(StepStatus.NOT_STARTED);
  const [error, setError] = useState<string | null>(null);
  const { evmWallet, solWallet } = useWallets();

  const triggerTransactions = useCallback(
    async (amount: string) => {
      if (!solWallet || !evmWallet) {
        return;
      }

      setTransactionState(StepStatus.LOADING);
      try {
        const connection = new Connection(process.env.NEXT_PUBLIC_ECLIPSE_RPC || "");

        // Define paramaters
        const destination = "ethereum";
        const recipient = evmWallet.address;
        const originToken = warpCore.tokens[1];
        const sender = solWallet.address;
        const originTokenAmount = originToken.amount(amount);

        // Get transactions
        const txs = await warpCore.getTransferRemoteTxs({
          originTokenAmount,
          destination,
          sender,
          recipient,
        });

        // Send transactions
        for (const tx of txs) {
          if (tx.type === ProviderType.SolanaWeb3) {
            // Sign and send Solana transaction
            const signer = await solWallet?.connector.getSigner<ISolana>();
            const signedTx = await signer.signTransaction(tx.transaction);
            const txId = await connection.sendRawTransaction(signedTx.serialize());
            const confirmation = await connection.confirmTransaction(txId, "confirmed");
          }
        }
      } catch (e) {
        const error = e as Error;
        console.error("Error during transfer:", error);
        setError(error.message);
        setTransactionState(StepStatus.FAILED);
      } finally {
        setTransactionState(StepStatus.COMPLETED);
      }
    },
    [evmWallet, solWallet]
  );

  return {
    triggerTransactions,
    transactionState,
    error,
  };
}
