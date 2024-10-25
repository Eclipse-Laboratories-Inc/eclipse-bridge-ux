import { Abi, PublicClient, WalletClient } from "viem";
import AccountantWithRateProviders from "../abis/AccountantWithRateProviders.json";
import { accountantAddress } from "../constants/contracts";

export async function getRateInQuote(
  { quote }: { quote: `0x${string}` },
  { publicClient }: { publicClient: PublicClient }
): Promise<bigint> {
  const rate = await publicClient.readContract({
    abi: AccountantWithRateProviders.abi as Abi,
    address: accountantAddress,
    functionName: "getRateInQuote",
    args: [quote],
  });

  return rate as bigint;
}
