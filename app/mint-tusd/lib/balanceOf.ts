import { erc20Abi, PublicClient } from "viem";

/**
 * Retrieves the balance of a specific address for a given ERC20 token.
 * @param balanceAddress The address for which the balance needs to be retrieved.
 * @param tokenAddress The address of the ERC20 token.
 * @param chainId The chain ID for the token (optional).
 * @returns The balance of the specified address as a BigInt.
 */
export async function balanceOf({
  tokenAddress,
  userAddress,
  publicClient,
}: {
  tokenAddress: `0x${string}`;
  userAddress: `0x${string}`;
  publicClient: PublicClient;
}) {
  if (tokenAddress === "0x") {
    throw new Error(`Error calling balanceOf(): tokenAddress cannot be "0x".`);
  }

  const balanceOfAsBigInt = publicClient.readContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [userAddress],
  });

  return balanceOfAsBigInt;
}
