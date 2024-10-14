import { Connection, Keypair, Transaction, PublicKey } from '@solana/web3.js';
import {
    buildWhirlpoolClient,
    PDAUtil,
    PoolUtil,
    SwapQuote, swapQuoteByInputToken,
    Whirlpool,
    WhirlpoolContext,
} from '@orca-so/whirlpools-sdk';
import { AddressUtil, DecimalUtil, Percentage, Wallet} from '@orca-so/common-sdk';
const BN = require("bn.js")
import Decimal from "decimal.js";

const WHIRLPOOL_PROGRAM_ID = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
const WHIRLPOOL_CONFIG_KEY = new PublicKey('2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ');
const WHIRLPOOL_TICK_SPACING = 64;

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

export async function getPoolAndQuote(
    context: WhirlpoolContext,
    mintA: PublicKey,
    mintB: PublicKey,
    sourceMint: PublicKey,
    amount: typeof BN,
    slippingTolerance: Percentage
): Promise<[Whirlpool, SwapQuote]> {
    const client = buildWhirlpoolClient(context);
    const whirlpoolKey = PDAUtil.getWhirlpool(
        WHIRLPOOL_PROGRAM_ID,
        WHIRLPOOL_CONFIG_KEY,
        AddressUtil.toPubKey(mintA),
        AddressUtil.toPubKey(mintB),
        WHIRLPOOL_TICK_SPACING
    );
    const whirlpool = await client.getPool(whirlpoolKey.publicKey);
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
    new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
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


