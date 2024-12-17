import * as anchor from "@project-serum/anchor";
import { Program, Provider } from "@coral-xyz/anchor";
import { CanonicalBridge } from "./canonical_bridge";
import { Connection, PublicKey } from "@solana/web3.js";
import testnet_idl from "./canonical_bridge_testnet.json";
import mainnet_idl from "./canonical_bridge.json";
const LosslessJSON = require('lossless-json');

export async function withdrawEthereum(
  wallet: any,
  receiver: string,
  eclipseRpc: string,
  configAccount: string,
  relayer: string,
  programId: string,
  amount: number
) {
  const signer = await wallet;
  const connection = new Connection(eclipseRpc);
  const provider = new anchor.AnchorProvider(connection, signer, {
    preflightCommitment: "processed",
  });
  anchor.setProvider(provider);
  console.log(provider)

  const idl = programId === "br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW" ? mainnet_idl : testnet_idl;
  const program = new Program<CanonicalBridge>(idl as CanonicalBridge, provider as Provider);
  const bridgeProgram = new PublicKey(programId);

  const randomNonce = Math.floor(Math.random() * 10**12);
  const [withdrawalReceiptPda, _withdrawalReceiptPdaBump ] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdrawal"),
        new anchor.BN(randomNonce).toArrayLike(Buffer, "le", 8),
      ],
      bridgeProgram 
  );

  try {
    const tx = await program.methods
      .withdraw(
        receiver,
        new anchor.BN(randomNonce), 
        new anchor.BN(10**9 * amount)
      )
      .accounts({
        withdrawer: signer.publicKey.toBase58(),
        //@ts-ignore
        config: configAccount,  // HARDCODED CONFIG ACCOUNT 
        withdrawalReceipt: withdrawalReceiptPda,
        relayer: relayer   // HARDCODED RELAYER ACCOUNT
      })
      .signers([])
      .rpc()

    return tx
  } catch (error) {
    console.error("Transaction Error:", error);
    throw error;
  }
}

export enum WithdrawStatus {
  UNKNOWN = 'Unknown',
  PROCESSING = 'Processing',
  PENDING = 'Pending',
  CLOSED = 'Closed'
}

export interface Message {
  from: number[];
  destination: string;
  amount_wei: string;
  withdraw_id: BigInt; 
  fee_receiver: string;
  fee_wei: string;
}

export interface MessageEntry {
  sender: string;
  message: Message;
  message_hash: number[];
  start_time: string;
}

export type Status = "Closed" | "Pending" | "Processing"; 
export type WithdrawObject = [MessageEntry, Status];

export async function getWithdrawalsByAddress(address: string, withdrawApi: string): Promise<WithdrawObject[]> {
  if (!withdrawApi) {
    return [];
  }

  const response = await fetch(`${withdrawApi}/${address}`); 
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const serverData = LosslessJSON.parse(await response.text());
  const result = parseWithdrawData(serverData);
  result.reverse()
  return result;

}

export async function getWithdrawalPda(bridgeProgram: string, withdrawalId: BigInt): Promise<PublicKey | null> {
  try {
    const programPublicKey = new PublicKey(bridgeProgram);
    const withdrawalNonce  = new anchor.BN(withdrawalId.toString()) 

    const [withdrawalPda, _] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('withdrawal'),
        withdrawalNonce.toArrayLike(Buffer, 'le', 8)
      ],
      programPublicKey
    );
    return withdrawalPda;

  } catch (error) {
    console.error("Error while getting nonce or deriving PDA:", error);
    return null
  }
}

function parseWithdrawData(data: any[][]): WithdrawObject[] {
  return data.map(([entry, status]) => {
    const message: Message = {
      from: entry.message[0], 
      destination: entry.message[1], 
      amount_wei: entry.message[2], 
      withdraw_id: BigInt(entry.message[3].value), 
      fee_receiver: entry.message[4], 
      fee_wei: entry.message[5], 
    };

    const messageEntry: MessageEntry = {
      sender: entry.sender,
      message,
      message_hash: entry.message_hash,
      start_time: entry.start_time,
    };

    return [messageEntry, status as Status];
  });
}

export function byteArrayToHex(byteArray: number[]): string {
  return byteArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function convertLosslessToNumbers(losslessNumbers: any[]): number[] {
  return losslessNumbers.map((item) => {
    if (typeof item === 'object' && typeof item.value === 'string') {
      return parseFloat(item.value);
    } else if (typeof item === 'number') {
      return item;
    } else {
      throw new Error('Invalid item in array: Expected LosslessNumber or number');
    }
  });
}
