import abi from "./abi.json";

export const MIN_DEPOSIT_AMOUNT    = 0.002;
export const MIN_WITHDRAWAL_AMOUNT = 0.01;

export const CONTRACT_ABI = abi;

export const DEPOSIT_TX_GAS_LIMIT: number = 113200; // max actually looks like 88100; overestimate for now
export const WITHDRAW_TX_FEE: number = 0.00000005 // ether, coming from Eclipse