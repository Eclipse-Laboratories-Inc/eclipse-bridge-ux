import { Abi, PublicClient } from "viem";
import AccountantWithRateProviders from "../abis/AccountantWithRateProviders.json";
import { accountantAddress } from "../constants/contracts";

export async function getRate(
  { tokenAddress }: { tokenAddress: `0x${string}` },
  { publicClient }: { publicClient: PublicClient }
): Promise<bigint> {
  const [isPeggedToBase, rateProviderAddress] = (await publicClient.readContract({
    abi: AccountantWithRateProviders.abi as Abi,
    address: accountantAddress,
    functionName: "rateProviderData",
    args: [tokenAddress],
  })) as [boolean, `0x${string}`];

  const rate = await publicClient.readContract({
    abi: AccountantWithRateProviders.abi as Abi,
    address: rateProviderAddress as `0x${string}`,
    functionName: "getRate",
    args: [],
  });

  return rate as bigint;
}
