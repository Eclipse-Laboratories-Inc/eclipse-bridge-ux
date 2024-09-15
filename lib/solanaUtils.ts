const solanaWeb3 = require('@solana/web3.js');
import { PublicKey, PublicKeyInitData } from '@solana/web3.js';
import { toHex } from 'viem';
import config from "@/config"

export async function getWalletBalance(publicKey: String) {
  // Connect to the Solana mainnet
  const connection = new solanaWeb3.Connection(
     config.eclipseRpc,
    'confirmed'
  );

  // Fetch the balance
  const balance = await connection.getBalance(new solanaWeb3.PublicKey(publicKey));

  // Convert balance from lamports to SOL (1 SOL = 10^9 lamports)
  return balance / solanaWeb3.LAMPORTS_PER_SOL;
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
