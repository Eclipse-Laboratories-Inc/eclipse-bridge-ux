import { Abi, PublicClient } from "viem";
import Chainlink from "../abis/Chainlink.json";

export interface LatestRoundDataResult {
  roundId: bigint;
  answer: bigint;
  startedAt: bigint;
  updatedAt: bigint;
  answeredInRound: bigint;
}

export async function latestRoundData({ publicClient }: { publicClient: PublicClient }): Promise<bigint> {
  const [roundId, answer, startedAt, updatedAt, answeredInRound] = (await publicClient.readContract({
    abi: Chainlink.abi as Abi,
    address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    functionName: "latestRoundData",
    args: [],
  })) as bigint[];

  return answer;
}
