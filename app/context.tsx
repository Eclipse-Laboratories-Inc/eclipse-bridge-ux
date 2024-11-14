import { createContext } from "react";
import { WalletClient } from 'viem';

export type DataArray = [(number | null), (number | null), (number | null)] // gas price, eth price, block number
export const EthereumDataContext = createContext<DataArray | null>(null);

let walletClient: any;
export const WalletClientContext = createContext<WalletClient | null>(walletClient);
