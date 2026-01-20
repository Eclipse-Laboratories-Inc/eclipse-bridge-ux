import { useWallets } from "@/app/hooks";
import { SolanaWalletConnector } from "@dynamic-labs/solana";
import { ProviderType } from "@hyperlane-xyz/sdk";
import { Connection } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { warpCore } from "../lib/warpcore";
import { StepStatus } from "../types";

export function useTokenTransfer() {
  const [transactionState, setTransactionState] = useState<StepStatus>(
    StepStatus.NOT_STARTED,
  );
  const [error, setError] = useState<string | null>(null);
  const { evmWallet, solWallet } = useWallets();
  const [interchainTransferFee, setInterchainTransferFee] = useState<bigint>(
    BigInt(0),
  );

  useEffect(() => {
    async function fetchFee() {
      try {
        const originToken = warpCore.tokens.find(
          (token) =>
            token.chainName === "eclipsemainnet" && token.symbol === "tUSD",
        );
        // console.log(originToken, "origin");
        if (!originToken || !solWallet?.address) {
          return;
        }
        const fee = await warpCore.getInterchainTransferFee({
          originToken,
          destination: "ethereum",
          sender: solWallet?.address,
        }); // 9 decimals
        // console.log("interrr", fee);
        setInterchainTransferFee(fee.amount * BigInt(1e9));
      } catch (error) {
        console.error("Error fetching interchain transfer fee:", error);
        throw error;
      }
    }
    fetchFee();
  }, [solWallet?.address]);

  const triggerTransactions = useCallback(
    async (amount: string) => {
      if (!solWallet || !evmWallet) {
        return;
      }

      setTransactionState(StepStatus.AWAITING_SIGNATURE);
      try {
        const connection = new Connection(
          process.env.NEXT_PUBLIC_ECLIPSE_RPC || "",
        );

        // Define paramaters
        const destination = "ethereum";
        const recipient = evmWallet.address;
        const originToken = warpCore.tokens[0];
        // console.log("tokens", warpCore.tokens);
        const sender = solWallet.address;
        const originTokenAmount = originToken.amount(amount);
        // console.log("origin token", originToken, originTokenAmount);

        const fee = await warpCore.getInterchainTransferFee({
          originToken,
          destination: "ethereum",
          sender,
        }); // 9 decimals
        setInterchainTransferFee(fee.amount * BigInt(1e9));

        // Get transactions
        const txs = await warpCore.getTransferRemoteTxs({
          originTokenAmount,
          destination,
          sender,
          recipient,
          interchainFee: fee,
        });

        // Send transactions
        for (const tx of txs) {
          if (tx.type === ProviderType.SolanaWeb3) {
            // Sign and send Solana transaction
            const signer = await (
              solWallet?.connector as SolanaWalletConnector
            ).getSigner();
            if (!signer) {
              return 1;
            }
            const signedTx = await signer.signTransaction(tx.transaction);
            const txId = await connection.sendRawTransaction(
              signedTx.serialize(),
            );
            await connection.confirmTransaction(txId, "confirmed");
          }
        }
        setTransactionState(StepStatus.COMPLETED);
      } catch (e) {
        const error = e as Error;
        console.error("Error during transfer:", error);
        setError(error.message);
        setTransactionState(StepStatus.FAILED);
        throw e;
      }
    },
    [evmWallet, solWallet],
  );

  return {
    triggerTransactions,
    transactionState,
    error,
    setTransactionState,
    interchainTransferFee,
  };
}
