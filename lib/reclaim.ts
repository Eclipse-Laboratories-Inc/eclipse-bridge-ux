import { createCloseAccountInstruction } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SendTransactionError,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { EmptyAccount, inspectProtocols, ProtocolReport } from "./protocols";

const MAX_TX_BYTES = 1100;
const FALLBACK_NETWORK_FEE = 50;

export type { EmptyAccount, ProtocolFinding, ProtocolReport, ProtocolStatus } from "./protocols";
export { PROTOCOL_CATALOG, formatEclipseEth, protocolPlaceholders } from "./protocols";

export type ReclaimScan = {
  owner: string;
  lamports: number;
  networkFee: number;
  empties: EmptyAccount[];
  tokenAccounts: number;
  protocols: ProtocolReport[];
};

export function explainReclaimError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (
    lower.includes("reject") ||
    lower.includes("user denied") ||
    lower.includes("cancelled") ||
    lower.includes("canceled")
  ) {
    return "The wallet rejected the transaction.";
  }
  if (lower.includes("429") || lower.includes("too many requests")) {
    return "The Eclipse network is busy. Wait a moment and try again.";
  }
  if (message.length > 320) return `${message.slice(0, 320)}…`;
  return message || "The transaction failed.";
}

function safeLamports(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("The wallet balance is outside the range this page can use.");
  }
  return value;
}

async function networkFee(
  connection: Connection,
  owner: PublicKey,
  instruction?: TransactionInstruction,
): Promise<number> {
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({ feePayer: owner, recentBlockhash: blockhash });
  if (instruction) transaction.add(instruction);
  const fee = await connection.getFeeForMessage(
    transaction.compileMessage(),
    "confirmed",
  );
  return safeLamports(fee.value ?? FALLBACK_NETWORK_FEE);
}

export async function scanWallet(
  connection: Connection,
  ownerAddress: string,
  onProtocol?: (report: ProtocolReport) => void,
): Promise<ReclaimScan> {
  const owner = new PublicKey(ownerAddress);
  const lamports = safeLamports(await connection.getBalance(owner, "confirmed"));
  const inspected = await inspectProtocols(connection, owner, (report) => {
    onProtocol?.(report);
  });
  const sample = inspected.empties[0];
  const fee = await networkFee(
    connection,
    owner,
    sample
      ? createCloseAccountInstruction(
          new PublicKey(sample.address),
          owner,
          owner,
          [],
          new PublicKey(sample.programId),
        )
      : undefined,
  );

  return {
    owner: owner.toBase58(),
    lamports,
    networkFee: fee,
    empties: inspected.empties,
    tokenAccounts: inspected.tokenAccounts,
    protocols: inspected.protocols,
  };
}

function closeInstruction(account: EmptyAccount, owner: PublicKey) {
  return createCloseAccountInstruction(
    new PublicKey(account.address),
    owner,
    owner,
    [],
    new PublicKey(account.programId),
  );
}

function pack(owner: PublicKey, instructions: TransactionInstruction[]) {
  const bundles: TransactionInstruction[][] = [];
  let current: TransactionInstruction[] = [];

  const sizeOf = (batch: TransactionInstruction[]) => {
    const transaction = new Transaction({
      feePayer: owner,
      recentBlockhash: PublicKey.default.toBase58(),
    });
    transaction.add(...batch);
    return transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).length;
  };

  for (const instruction of instructions) {
    const next = [...current, instruction];
    if (current.length > 0 && sizeOf(next) > MAX_TX_BYTES) {
      bundles.push(current);
      current = [instruction];
      continue;
    }
    if (sizeOf(next) > MAX_TX_BYTES) {
      throw new Error("A reclaim instruction is too large to submit.");
    }
    current = next;
  }
  if (current.length > 0) bundles.push(current);
  return bundles;
}

export type SignedTransaction = {
  serialize: () => Uint8Array;
};

export type EclipseSigner = {
  signTransaction: (transaction: Transaction) => Promise<SignedTransaction>;
};

export async function reclaimRent(input: {
  connection: Connection;
  ownerAddress: string;
  accounts: EmptyAccount[];
  signer: EclipseSigner;
  onSignature?: (signature: string) => void;
}): Promise<string[]> {
  const owner = new PublicKey(input.ownerAddress);
  const bundles = pack(
    owner,
    input.accounts.map((account) => closeInstruction(account, owner)),
  );
  const signatures: string[] = [];

  for (const instructions of bundles) {
    const { blockhash, lastValidBlockHeight } =
      await input.connection.getLatestBlockhash("confirmed");
    const transaction = new Transaction({
      feePayer: owner,
      recentBlockhash: blockhash,
    }).add(...instructions);
    const signed = await input.signer.signTransaction(transaction);
    try {
      const signature = await input.connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight: false, preflightCommitment: "confirmed", maxRetries: 3 },
      );
      await input.connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      signatures.push(signature);
      input.onSignature?.(signature);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(input.connection).catch(() => []);
        throw new Error(
          [error.message, ...logs].filter(Boolean).join("\n"),
        );
      }
      throw error;
    }
  }

  return signatures;
}
