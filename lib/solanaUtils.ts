import { Connection, PublicKey, PublicKeyInitData, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toHex } from 'viem';

// Cache the connection to avoid recreating it on each call
const connection = new Connection(process.env.NEXT_PUBLIC_ECLIPSE_RPC || '', 'confirmed');

// Fetch wallet balance in SOL
export async function getWalletBalance(publicKey: string): Promise<number> {
  try {
    // Validate publicKey input
    const solanaPublicKey = new PublicKey(publicKey);

    // Fetch the balance in lamports
    const balanceInLamports = await connection.getBalance(solanaPublicKey);

    // Convert lamports to SOL and return
    return balanceInLamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw new Error('Invalid Solana address or connection issue');
  }
}

// Convert Solana address to bytes32
export const solanaToBytes32 = (solanaAddress: PublicKeyInitData): string => {
  try {
    const publicKey = new PublicKey(solanaAddress);
    return toHex(publicKey.toBytes().slice(0, 32)); // Convert to bytes32 hex
  } catch (error) {
    console.error('Invalid Solana address:', error);
    throw new Error('Invalid Solana address');
  }
};
