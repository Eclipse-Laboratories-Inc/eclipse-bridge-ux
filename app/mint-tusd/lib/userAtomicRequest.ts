import { Abi, PublicClient } from "viem";
import AtomicQueue from "../abis/AtomicQueue.json";
import { atomicQueueContractAddress } from "../constants/contracts";

export async function getUserAtomicRequest(
  {
    userAddress,
    offerAddress,
    wantAddress,
  }: {
    userAddress: `0x${string}`;
    offerAddress: `0x${string}`;
    wantAddress: `0x${string}`;
  },
  { publicClient }: { publicClient: PublicClient }
): Promise<{
  deadline: bigint;
  atomicPrice: bigint;
  offerAmount: bigint;
  inSolve: boolean;
}> {
  const [deadline, atomicPrice, offerAmount, inSolve] = (await publicClient.readContract({
    abi: AtomicQueue.abi as Abi,
    address: atomicQueueContractAddress,
    functionName: "userAtomicRequest",
    args: [userAddress, offerAddress, wantAddress],
  })) as [bigint, bigint, bigint, boolean];

  return { deadline, atomicPrice, offerAmount, inSolve };
}
