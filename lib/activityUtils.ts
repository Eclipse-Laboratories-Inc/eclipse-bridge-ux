import { decodeAbiParameters } from 'viem'
import { PublicKey } from '@solana/web3.js';
const solanaWeb3 = require('@solana/web3.js');
import * as anchor from '@project-serum/anchor';

function low64(value: bigint): bigint {
    return value & BigInt("0xFFFFFFFFFFFFFFFF");
}

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

export async function getNonce(walletClient: any, transactionHash: string, bridgeProgram: string): Promise<PublicKey | null> {
  try {
    const txHashLowU64 = low64(BigInt(transactionHash))
    const ethDepositNonceBN = new anchor.BN(txHashLowU64, 10);
    const programPublicKey = new PublicKey(bridgeProgram);

    const [depositReceiptPda, _] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('deposit'),
        ethDepositNonceBN.toArrayLike(Buffer, 'le', 8)
      ],
      programPublicKey
    );
    return depositReceiptPda;

  } catch (error) {
    console.error("Error while getting nonce or deriving PDA:", error);
    return null
  }
}


// fix
export async function getEclipseTransaction(address: PublicKey | null, eclipseRpc: string) {
  if (!address) {return null;} 
  const connection = new solanaWeb3.Connection(
    eclipseRpc,
    'confirmed'
  );

  const data = await connection.getSignaturesForAddress(address);
  if (!data) return null
  return data
} 


// fix
export async function checkDepositWithPDA(address: PublicKey | null, eclipseRpc: string) {
  if (!address) {return null;} 
  const connection = new solanaWeb3.Connection(
    eclipseRpc,
    'confirmed'
  );

  const data = await connection.getAccountInfo(address);
  if (!data) return null
  return data
}


export async function getLastDeposits(address: string, chain: string) {
  if (!address) return [];
  const response = await fetch(`/api/get-transactions?address=${address}&chain=${chain}`)
  const deposits = await response.json();

  return deposits;
}

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


export const timeLeft = (timestamp: number): string => {
  const now = Date.now(); 
  const secondsLeft = Math.floor((timestamp - now) / 1000); 

  if (secondsLeft < 60) {
    return `${secondsLeft} secs`;
  } else if (secondsLeft < 3600) {
    const minutes = Math.ceil(secondsLeft / 60);
    return minutes === 1 ? `1 min` : `${minutes} mins`;
  } else if (secondsLeft < 86400) {
    const hours = Math.ceil(secondsLeft / 3600);
    return hours === 1 ? `1 hour` : `${hours} hours`;
  } else if (secondsLeft < 2592000) { 
    const days = Math.ceil(secondsLeft / 86400);
    return days === 1 ? `1 day` : `${days} days`;
  } else {
    return ""
  }
};
