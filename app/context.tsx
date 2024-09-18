import { createContext } from "react";
import { WalletClient } from 'viem';

export type DataArray = (number | null)[] 
export const EthereumDataContext = createContext<DataArray | null>(null);

let walletClient: any;
export const WalletClientContext = createContext<WalletClient>(walletClient);
