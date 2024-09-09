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

export async function getNonce(walletClient: any, transactionHash: string) {
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

    const ethDepositNonceBN = new anchor.BN(values[3].replace("0x", ""), 16);
    const programPublicKey = new PublicKey("br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW");

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
  }
}


export async function getEclipseTransaction(address: PublicKey | undefined) {
  const connection = new solanaWeb3.Connection(
    'https://mainnetbeta-rpc.eclipse.xyz',
    'confirmed'
  );

  const data = await connection.getSignaturesForAddress(address);
  return data
} 


export async function checkDepositWithPDA(address: PublicKey | string | undefined ) {
  const connection = new solanaWeb3.Connection(
    'https://mainnetbeta-rpc.eclipse.xyz',
    'confirmed'
  );

  const data = await connection.getAccountInfo(address);
  return data
}


export async function getLastDeposits(address: string) {
  const apiKey = 'G6FW2T6RHAAHM9H5ATF8GVIFX8F4K5S38B';

  const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${apiKey}`)
  const data = await response.json();

  let deposits = [];
  for (const tx of data.result) {
    // if to is bridge contract
    if (tx.to === "0x83cb71d80078bf670b3efec6ad9e5e6407cd0fd1") {
      deposits.push(tx);
    }
  }

  return deposits;
}

export const timeAgo = (timestamp: number): string => {
  const now = Date.now(); 
  const secondsPast = Math.floor((now - timestamp * 1000) / 1000); 

  if (secondsPast < 60) {
    return `${secondsPast} seconds ago`;
  } else if (secondsPast < 3600) {
    const minutes = Math.floor(secondsPast / 60);
    return minutes === 1 ? `1 minute ago` : `${minutes} minutes ago`;
  } else if (secondsPast < 86400) {
    const hours = Math.floor(secondsPast / 3600);
    return hours === 1 ? `1 hour ago` : `${hours} hours ago`;
  } else if (secondsPast < 2592000) { 
    const days = Math.floor(secondsPast / 86400);
    return days === 1 ? `1 day ago` : `${days} days ago`;
  } else if (secondsPast < 31536000) {
    const months = Math.floor(secondsPast / 2592000);
    return months === 1 ? `1 month ago` : `${months} months ago`;
  } else {
    const years = Math.floor(secondsPast / 31536000);
    return years === 1 ? `1 year ago` : `${years} years ago`;
  }
};
