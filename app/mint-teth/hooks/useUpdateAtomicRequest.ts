import { useWallets } from "@/app/hooks";
import { useCallback, useState } from "react";
import { Abi, Address, erc20Abi, PublicClient, WalletClient } from "viem";
import { atomicQueueContractAddress, warpRouteContractAddress } from "../constants/contracts";
import AtomicQueue from "../abis/AtomicQueue.json";
import { StepStatus } from "../types";

export interface AtomicRequest {
  deadline: bigint;
  atomicPrice: bigint;
  offerAmount: bigint;
  inSolve: boolean;
}

export interface UpdateAtomicRequestOptions {
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
}

export interface UpdateAtomicRequestParams {
  offer: Address;
  want: Address;
  userRequest: AtomicRequest;
}

export function useUpdateAtomicRequest() {
  // Hooks
  const { evmWallet } = useWallets();

  // State
  const [approvalState, setApprovalState] = useState<StepStatus>(StepStatus.NOT_STARTED);
  const [transactionState, setTransactionState] = useState<StepStatus>(StepStatus.NOT_STARTED);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const userAddress = evmWallet?.address as Address;

  // Actions
  const updateAtomicRequest = useCallback(
    async (
      updateAtomicRequestParams: UpdateAtomicRequestParams,
      updateAtomicRequestOptions: UpdateAtomicRequestOptions
    ): Promise<string | undefined> => {
      const { offer, want, userRequest } = updateAtomicRequestParams;
      const { publicClient, walletClient } = updateAtomicRequestOptions;
      const { offerAmount } = userRequest;
      if (!userAddress || !publicClient || !walletClient) return;

      try {
        ////////////////////////////////
        // 1. Check Allowance
        ////////////////////////////////
        setApprovalState(StepStatus.LOADING);
        const allowanceAsBigInt = await publicClient.readContract({
          abi: erc20Abi,
          address: offer,
          functionName: "allowance",
          args: [userAddress, atomicQueueContractAddress],
        });

        ////////////////////////////////
        // 2. Approve if allowance is insufficient
        ////////////////////////////////
        if (offerAmount > allowanceAsBigInt) {
          const { request: approvalRequest } = await publicClient.simulateContract({
            abi: erc20Abi,
            address: offer,
            functionName: "approve",
            args: [atomicQueueContractAddress, offerAmount],
            account: userAddress,
          });
          await walletClient.writeContract(approvalRequest);
        }
        setApprovalState(StepStatus.COMPLETED);
      } catch (e) {
        const error = e as Error;
        setApprovalState(StepStatus.FAILED);
        console.error(error);
        setError(error.message);
      }

      try {
        ////////////////////////////////
        // 3. Simulate
        ////////////////////////////////
        setTransactionState(StepStatus.LOADING);
        const { request: depositRequest } = await publicClient.simulateContract({
          abi: AtomicQueue.abi as Abi,
          address: atomicQueueContractAddress,
          functionName: "updateAtomicRequest",
          args: [offer, want, userRequest],
          account: userAddress,
        });

        ////////////////////////////////
        // 4. Write
        ////////////////////////////////
        const txHash = await walletClient.writeContract(depositRequest);

        ////////////////////////////////
        // 5. Wait for receipt
        ////////////////////////////////
        await publicClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: 60_000,
          confirmations: 1,
          pollingInterval: 10_000,
          retryCount: 5,
          retryDelay: 5_000,
        });

        setTransactionState(StepStatus.COMPLETED);

        return txHash;
      } catch (e) {
        const error = e as Error;
        setTransactionState(StepStatus.FAILED);
        console.error(error);
        setError(error.message);
      }
    },

    [userAddress]
  );

  return { updateAtomicRequest, transactionState, approvalState, error };
}
