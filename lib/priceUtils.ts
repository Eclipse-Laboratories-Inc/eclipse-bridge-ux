import { Connection, PublicKey } from '@solana/web3.js';
const BN = require("bn.js")
import Decimal from "decimal.js";

const WHIRLPOOL_PROGRAM_ID = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc');
const PYTH_PUBLIC_KEY      = new PublicKey('HDwcJBJXjL9FpJ7UBsYBtaDjsBUhuLCUYoz3zr8SWWaQ')

function findCorrectPool(mintA: PublicKey, mintB: PublicKey): PublicKey {
    // usdc
    if ([mintA.toBase58(), mintB.toBase58()].includes("AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE")) {
        return new PublicKey("2FR5TF3iDCLzGbWAuejR7LKiUL1J8ERnC1z2WGhC9s6D");
    }

    // sol
    return new PublicKey("CFYaUSe34VBEoeKdJBXm9ThwsWoLaQ5stgiA3eUWBwV4");
}


export async function fetchTokenPrice() {
  const response = await fetch("https://pools-api-eclipse.mainnet.orca.so/prices?amount=100000000");

  if (!response.ok) {
    throw new Error("Failed to fetch prices.");
  }

  const data = await response.json();
  console.log(data, "data")
  
  return [
    data.data.GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn, //TETH  
    data.data.BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL // SOL	
  ]
}
