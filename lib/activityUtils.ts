import { decodeAbiParameters } from 'viem'
const solanaWeb3 = require('@solana/web3.js');
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

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
  };
}

export async function getNonce(walletClient: any, transactionHash: string): Promise<PublicKey | null> {
  try {
    const data = await walletClient.request({
      method: "eth_getTransactionReceipt",
      params: [transactionHash]
    });
    if (!data.logs[0]) return null; 

    const values = decodeAbiParameters([
      { name: 'to', type: 'bytes' },
      { name: 'toChainId', type: 'bytes' },
      { name: 'message', type: 'bytes' },
      { name: 'extraData', type: 'bytes' }
    ], data.logs[0].data);

    console.log(process.env.NEXT_PUBLIC_BRIDGE_PROGRAM, "kurdistanee")
    const ethDepositNonceBN = new anchor.BN(values[3].replace("0x", ""), 16);
    const programPublicKey = new PublicKey(process.env.NEXT_PUBLIC_BRIDGE_PROGRAM || '');

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
export async function getEclipseTransaction(address: PublicKey | null) {
  if (!address) {return null;} 
  const connection = new solanaWeb3.Connection(
    process.env.NEXT_PUBLIC_ECLIPSE_RPC,
    'confirmed'
  );

  const data = await connection.getSignaturesForAddress(address);
  if (!data) return null
  return data
} 


// fix
export async function checkDepositWithPDA(address: PublicKey | null ) {
  if (!address) {return null;} 
  const connection = new solanaWeb3.Connection(
    process.env.NEXT_PUBLIC_ECLIPSE_RPC,
    'confirmed'
  );

  const data = await connection.getAccountInfo(address);
  if (!data) return null
  return data
}


export async function getLastDeposits(address: string) {
  const response = await fetch(`/api/get-transactions?address=${address}`)
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
