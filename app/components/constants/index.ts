import { parseAbi } from "viem";
import abi from "./abi.json";

export const MIN_DEPOSIT_AMOUNT    = 0.002;
export const MIN_WITHDRAWAL_AMOUNT = 0.01;

export const CONTRACT_ABI = abi;

export const TREASURY_ABI = parseAbi([
  "function hasRole(bytes32 role, address account) view returns (bool)",
]);

// treasury DEPOSITOR_ROLE() constant, same on mainnet and sepolia; hardcoded to save an RPC round trip
export const TREASURY_DEPOSITOR_ROLE = "0xd50fd8c1b5fa5213a5974932fcc33d2992a99225bc9319caf7cf652d0d2b9acf";

export const DEPOSIT_TX_GAS_LIMIT: number = 113200; // max actually looks like 88100; overestimate for now
export const WITHDRAW_TX_FEE: number = 0.00000005 // ether, coming from Eclipse

export const ECLIPSESCAN_BASE_URL = 'https://eclipsescan.xyz'

export const ETHERSCAN_MAINNET_URL = 'https://etherscan.io'
export const ETHERSCAN_TESTNET_URL = 'https://sepolia.etherscan.io'