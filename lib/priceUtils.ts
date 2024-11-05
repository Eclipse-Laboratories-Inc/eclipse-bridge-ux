import { Connection, Keypair, Transaction, PublicKey } from '@solana/web3.js';
import {
    buildWhirlpoolClient,
    PoolUtil,
    SwapQuote, swapQuoteByInputToken,
    Whirlpool,
    WhirlpoolContext,
    WhirlpoolsConfigExtensionData
} from '@orca-so/whirlpools-sdk';
import { AddressUtil, DecimalUtil, Percentage, Wallet} from '@orca-so/common-sdk';
const BN = require("bn.js")
import Decimal from "decimal.js";

const WHIRLPOOL_PROGRAM_ID = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');

export function getABMints(sourceMint: PublicKey, targetMint: PublicKey): [PublicKey, PublicKey] {
    const [addressA, addressB] = PoolUtil.orderMints(sourceMint, targetMint);
    return [AddressUtil.toPubKey(addressA), AddressUtil.toPubKey(addressB)];
}

export function getWhirlpoolsContext(connection: Connection): WhirlpoolContext {
    const DUMMY_WALLET = {
      async signTransaction(tx: Transaction) {
        return tx;
      },
      async signAllTransactions(txs: Transaction[]) {
        return txs;
      },
      publicKey: Keypair.generate().publicKey
    };
    return WhirlpoolContext.from(connection, DUMMY_WALLET as Wallet, WHIRLPOOL_PROGRAM_ID);
}


function findCorrectPool(mintA: PublicKey, mintB: PublicKey): PublicKey {
    // usdc
    if ([mintA.toBase58(), mintB.toBase58()].includes("AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE")) {
        return new PublicKey("2FR5TF3iDCLzGbWAuejR7LKiUL1J8ERnC1z2WGhC9s6D");
    }

    // sol
    return new PublicKey("CFYaUSe34VBEoeKdJBXm9ThwsWoLaQ5stgiA3eUWBwV4");
}


export async function getPoolAndQuote(
    context: WhirlpoolContext,
    mintA: PublicKey,
    mintB: PublicKey,
    sourceMint: PublicKey,
    amount: typeof BN,
    slippingTolerance: Percentage
): Promise<[Whirlpool, SwapQuote]> {
    const client = buildWhirlpoolClient(context);
    const whirlpoolKey = findCorrectPool(mintA, mintB);
    const whirlpool = await client.getPool(whirlpoolKey);
    const quote = await swapQuoteByInputToken(
        whirlpool,
        sourceMint,
        amount,
        slippingTolerance,
        WHIRLPOOL_PROGRAM_ID,
        context.fetcher,
    );
    return [whirlpool, quote];
}

export async function fetchTokenPrice(connection: Connection, token: string) {
  const ctx = getWhirlpoolsContext(connection);
  console.log("checkprice")

  const [mintA, mintB] = getABMints(
    new PublicKey(token), 
    // USDC mint addr
    new PublicKey("AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE")
  );
  const [_, quote] = await getPoolAndQuote(
    ctx,
    mintA,
    mintB,
    new PublicKey(token),
    DecimalUtil.toBN(new Decimal("1"), 6),
    Percentage.fromFraction(10, 1000)
  );
  return (quote.estimatedAmountOut.words[0] / 1000000) 
}


