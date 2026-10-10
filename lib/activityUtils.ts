import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

function low64(value) {
  return value & BigInt("0xFFFFFFFFFFFFFFFF");
}

export async function generateTxObjectForDetails(walletClient, txHash) {
  const [receipt, transaction] = await Promise.all([
    walletClient.request({ method: "eth_getTransactionReceipt", params: [txHash] }),
    walletClient.request({ method: "eth_getTransactionByHash", params: [txHash] }),
  ]);

  if (!transaction) return null;

  const block = await walletClient.request({
    method: "eth_getBlockByNumber",
    params: [transaction.blockNumber, false],
  });

  return {
    hash: txHash,
    value: transaction?.value ?? "0", 
    gasPrice: transaction?.gasPrice ?? "0",
    gasUsed: receipt?.gasUsed ?? "0",
    timeStamp: parseInt(block?.timestamp || "0", 16),
    txreceipt_status: receipt?.status?.replace("0x", "") ?? "0",
  };
}

export async function getNonce(walletClient, transactionHash, bridgeProgram) {
  try {
    const txHashLowU64 = low64(BigInt(transactionHash));
    const ethDepositNonceBN = new anchor.BN(txHashLowU64.toString(), 10);
    const programPublicKey = new PublicKey(bridgeProgram);

    const [depositReceiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("deposit"), ethDepositNonceBN.toArrayLike(Buffer, "le", 8)],
      programPublicKey
    );
    return depositReceiptPda;
  } catch (error) {
    console.error("Error getting nonce or deriving PDA:", error);
    return null;
  }
}

export async function getEclipseTransaction(address, eclipseRpc) {
  if (!address) return null;
  const connection = new PublicKey(eclipseRpc, "confirmed");
  return connection.getSignaturesForAddress(address) || null;
}

export async function checkDepositWithPDA(address, eclipseRpc) {
  if (!address) return null;
  const connection = new PublicKey(eclipseRpc, "confirmed");
  return connection.getAccountInfo(address) || null;
}

export async function getLastDeposits(address, chain) {
  if (!address) return [];
  return fetch(`/api/get-transactions?address=${address}&chain=${chain}`)
    .then(res => res.json())
    .catch(() => []);
}

export const timeAgo = (timestamp) => {
  const now = Date.now();
  const secondsPast = Math.floor((now - timestamp * 1000) / 1000);
  const units = [
    [60, "Sec"],
    [3600, "Min"],
    [86400, "Hour"],
    [2592000, "Day"],
    [31536000, "Month"],
  ];

  for (const [unit, label] of units) {
    if (secondsPast < unit) return `${Math.floor(secondsPast / (unit / 60))} ${label}${secondsPast < unit / 60 ? "s" : ""} ago`;
  }
  return `${Math.floor(secondsPast / 31536000)} Year(s) ago`;
};

export const timeLeft = (timestamp) => {
  const now = Date.now();
  const secondsLeft = Math.floor((timestamp - now) / 1000);
  const units = [
    [60, "sec"],
    [3600, "min"],
    [86400, "hour"],
    [2592000, "day"],
  ];
  
  for (const [unit, label] of units) {
    if (secondsLeft < unit) return `${Math.ceil(secondsLeft / (unit / 60))} ${label}${secondsLeft < unit / 60 ? "s" : ""}`;
  }
  return "";
};
