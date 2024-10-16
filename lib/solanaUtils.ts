const solanaWeb3 = require('@solana/web3.js');
import { PublicKey, PublicKeyInitData, Connection } from '@solana/web3.js';
import { createAssociatedTokenAccount, getAccount, getAssociatedTokenAddress, TokenAccountNotFoundError } from '@solana/spl-token';
import { toHex } from 'viem';
import { toTokenAmount } from '@orca-so/whirlpools-sdk';

export async function getWalletBalance(publicKey: String, eclipseRpc: string) {
  // Connect to the Solana mainnet
  const connection = new solanaWeb3.Connection(
    eclipseRpc,
    'confirmed'
  );

  // Fetch the balance
  const balance = await connection.getBalance(new solanaWeb3.PublicKey(publicKey));

  // Convert balance from lamports to SOL (1 SOL = 10^9 lamports)
  return balance / solanaWeb3.LAMPORTS_PER_SOL;
}

export async function getTokenBalance(tokenMint: string, wallet: string) {
  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=e0dc13bd-8a5d-424c-8895-9d26bbb1ffdb", "finalized");

  const mintAddress = new PublicKey(tokenMint);
  const walletAddress = new PublicKey(wallet);

  const associatedTokenAddress = await getAssociatedTokenAddress(
    mintAddress,
    walletAddress
  );
  try {
    const tokenAccount = await connection.getTokenAccountBalance(associatedTokenAddress);
    const tokenBalance = tokenAccount.value;

  return parseInt(tokenBalance.amount);
  } catch {
    return 0
  }
}

export const solanaToBytes32 = (solanaAddress: PublicKeyInitData) => {
  try {
    const publicKey = new PublicKey(solanaAddress);
    return toHex(publicKey.toBytes().slice(0, 32));
  } catch (error) {
      console.error('Invalid Solana address', error);
      throw new Error('Invalid Solana address');
    }
 };

