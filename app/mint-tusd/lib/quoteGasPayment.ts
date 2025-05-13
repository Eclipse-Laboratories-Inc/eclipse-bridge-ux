import { Abi, Address, PublicClient } from "viem";
import GasRouter from "../abis/GasRouter.json";

export async function quoteGasPayment(
  { destinationDomain }: { destinationDomain: number },
  { publicClient, contractAddress }: { publicClient: PublicClient; contractAddress: Address }
): Promise<bigint> {
  const gasPayment = await publicClient.readContract({
    abi: GasRouter.abi as Abi,
    address: contractAddress,
    functionName: "quoteGasPayment",
    args: [destinationDomain],
  });

  return gasPayment as bigint;
}
