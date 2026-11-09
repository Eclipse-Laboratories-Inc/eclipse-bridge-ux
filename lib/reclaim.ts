import {
  createCloseAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SendTransactionError,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

const TOKEN_PROGRAMS = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID];
const MAX_TX_BYTES = 1100;
const FALLBACK_NETWORK_FEE = 50;

export type EmptyAccount = {
  address: string;
  mint: string;
  programId: string;
  lamports: number;
};

export type ReclaimScan = {
  owner: string;
  lamports: number;
  networkFee: number;
  empties: EmptyAccount[];
  tokenAccounts: number;
};

type ParsedTokenAccount = {
  pubkey: PublicKey;
  account: {
    lamports: number;
    data: {
      parsed?: {
        info?: {
          mint?: string;
          owner?: string;
          state?: string;
          tokenAmount?: { amount?: string };
        };
      };
    };
  };
};

export function formatEclipseEth(lamports: number): string {
  if (!Number.isSafeInteger(lamports) || lamports < 0) {
    throw new Error("Balance is outside the range this page can display.");
  }
  const whole = Math.floor(lamports / 1_000_000_000);
  const fraction = (lamports % 1_000_000_000)
    .toString()
    .padStart(9, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

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

async function tokenAccounts(
  connection: Connection,
  owner: PublicKey,
  programId: PublicKey,
): Promise<ParsedTokenAccount[]> {
  const response = await connection.getParsedTokenAccountsByOwner(owner, {
    programId,
  });
  return response.value as ParsedTokenAccount[];
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
): Promise<ReclaimScan> {
  const owner = new PublicKey(ownerAddress);
  const lamports = safeLamports(await connection.getBalance(owner, "confirmed"));
  const listed = await Promise.all(
    TOKEN_PROGRAMS.map(async (programId) => {
      try {
        return await tokenAccounts(connection, owner, programId);
      } catch (error) {
        return error instanceof Error ? error : new Error(String(error));
      }
    }),
  );
  if (listed.every((entry) => entry instanceof Error)) {
    throw listed[0];
  }

  const empties: EmptyAccount[] = [];
  let tokenAccountCount = 0;
  for (let index = 0; index < listed.length; index += 1) {
    const entry = listed[index];
    if (entry instanceof Error) continue;
    const programId = TOKEN_PROGRAMS[index].toBase58();
    for (let accountIndex = 0; accountIndex < entry.length; accountIndex += 1) {
      const account = entry[accountIndex];
      tokenAccountCount += 1;
      const info = account.account.data.parsed?.info;
      const amount = BigInt(info?.tokenAmount?.amount ?? "0");
      if (
        amount !== BigInt(0) ||
        info?.state === "frozen" ||
        !info?.mint ||
        info.owner !== owner.toBase58()
      ) {
        continue;
      }
      empties.push({
        address: account.pubkey.toBase58(),
        mint: info.mint,
        programId,
        lamports: safeLamports(account.account.lamports),
      });
    }
  }

  const sample = empties[0];
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
    empties,
    tokenAccounts: tokenAccountCount,
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
