import { createContext } from "react";
import { createWalletClient, custom, WalletClient } from 'viem';
import { mainnet } from 'viem/chains';

export type DataArray = (number | null)[] 
export const EthereumDataContext = createContext<DataArray | null>(null);

let walletClient: any;
export const WalletClientContext = createContext<WalletClient>(walletClient);
