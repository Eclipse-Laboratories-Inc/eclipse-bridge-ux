import { Connection, PublicKey } from "@solana/web3.js";
import { parseUnits } from "viem";

const eclipseRpcUrl = process.env.NEXT_PUBLIC_ECLIPSE_RPC;

export async function getSolanaBalance(userAddress: string, tokenMint: string): Promise<bigint> {
  if (!eclipseRpcUrl) {
    throw new Error("Eclipse RPC URL is not defined");
  }

  const connection = new Connection(eclipseRpcUrl, "confirmed");

  // Create PublicKey objects for the wallet and token mint
  const wallet = new PublicKey(userAddress);
  const tokenMintAsPublicKey = new PublicKey(tokenMint);

  // Fetch all token accounts for the given wallet and token mint
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
    mint: tokenMintAsPublicKey,
  });

  // Initialize balance
  let balance = 0;

  // Accumulate balance across all token accounts for this mint
  // (Solana can split token balances across multiple accounts under the same wallet)
  tokenAccounts.value.forEach((accountInfo) => {
    const tokenAmount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
    balance += tokenAmount; // Add balance from each token account
  });

  return parseUnits(balance.toString(), 18);
}
