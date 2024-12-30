import type { Buffer } from 'buffer';
import type { ProcessEnv } from 'process';

import { decodeAbiParameters } from 'viem';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

/**
 * Extracts the least significant 64 bits from the bigint value
 * @param value - Input value of bigint
 * @returns Low 64 bits as bigint
 */
function low64(value: bigint): bigint {
    return value & BigInt("0xFFFFFFFFFFFFFFFF");
}

/**
 * Generates a transaction object with details to display
 * @param walletClient
 * txHash @param - Transaction Hash
 */
export async function generateTxObjectForDetails(walletClient: any, txHash: string) {
  const receiptPromise = walletClient.request({
    method: 'eth_getTransactionReceipt',
    params: [txHash],
  });

  // eth_getTransactionByHash
  const transactionPromise = walletClient.request({
    method: 'eth_getTransactionByHash',
    params: [txHash],
  });

  const [receipt, transaction] = await Promise.all([
    receiptPromise,
    transactionPromise,
  ]);

  const blockPromise = walletClient.request({
    method: 'eth_getBlockByNumber',
    params: [transaction.blockNumber, false],
  });

  const block = await blockPromise;

  return {
    hash: txHash,
    value: transaction.value, // in wei
    gasPrice: transaction.gasPrice, // gas price in wei
    gasUsed: receipt.gasUsed, // gas used in the transaction
    timeStamp: parseInt(block.timestamp, 16), // block timestamp in seconds
    txreceipt_status: receipt.status.replace("0x", "") 
  };
}

/**
 * Receives a PDA (Program Derived Address) based on the transaction hash
 * @param walletClient
 * @param transactionHash - Transaction Hash
 * @returns Promise<PublicKey | null>
 */
export async function getNonce(walletClient: any, transactionHash: string): Promise<PublicKey | null> {
  try {
    const txHashLowU64 = low64(BigInt(transactionHash));
    const ethDepositNonceBN = new anchor.BN(txHashLowU64.toString(), 10);
    const programPublicKey = new PublicKey(process.env.NEXT_PUBLIC_BRIDGE_PROGRAM || '');

    const [depositReceiptPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('deposit'),
        ethDepositNonceBN.toArrayLike(Buffer, 'le', 8)
      ],
      programPublicKey
    );
    return depositReceiptPda;

  } catch (error) {
    console.error("Error while getting nonce or deriving PDA:", error);
    return null;
  }
}

/**
 * Receives Eclipse transactions for the specified address
 * @param address - Public address key
 */
export async function getEclipseTransaction(address: PublicKey | null) {
  if (!address) return null;
  const connection = new Connection(
    process.env.NEXT_PUBLIC_ECLIPSE_RPC || '',
    'confirmed'
  );

  const data = await connection.getSignaturesForAddress(address);
  return data;
}

/**
 * Checks the deposit using PDA
 * @param address - Public address key
 */
export async function checkDepositWithPDA(address: PublicKey | null) {
  if (!address) return null;
  const connection = new Connection(
    process.env.NEXT_PUBLIC_ECLIPSE_RPC || '',
    'confirmed'
  );

  const data = await connection.getAccountInfo(address);
  return data;
}

/**
 * Receives the latest deposits for the address
 * @param address - Wallet address
 */
export async function getLastDeposits(address: string) {
  if (!address) return [];
  const response = await fetch(`/api/get-transactions?address=${address}`);
  const deposits = await response.json();
  return deposits;
}

/**
 * Formats the timestamp into a readable "time back" format
 * @param timestamp - Timestamp in seconds
 * @returns Formatted string
 */
export const timeAgo = (timestamp: number): string => {
  const now = Date.now(); 
  const secondsPast = Math.floor((now - timestamp * 1000) / 1000); 

  if (secondsPast < 60) {
    return `${secondsPast} Secs ago`;
  } else if (secondsPast < 3600) {
    const minutes = Math.floor(secondsPast / 60);
    return minutes === 1 ? `1 Min ago` : `${minutes} Mins ago`;
  } else if (secondsPast < 86400) {
    const hours = Math.floor(secondsPast / 3600);
    return hours === 1 ? `1 Hour ago` : `${hours} Hours ago`;
  } else if (secondsPast < 2592000) { 
    const days = Math.floor(secondsPast / 86400);
    return days === 1 ? `1 Day ago` : `${days} Days ago`;
  } else if (secondsPast < 31536000) {
    const months = Math.floor(secondsPast / 2592000);
    return months === 1 ? `1 Month ago` : `${months} Months ago`;
  } else {
    const years = Math.floor(secondsPast / 31536000);
    return years === 1 ? `1 Year ago` : `${years} Years ago`;
  }
};
