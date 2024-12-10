import { createContext } from "react";
import { WalletClient } from 'viem';

export type DataArray = [(number | null), (number | null), (number | null)] // gas price, eth price, block number
export const EthereumDataContext = createContext<DataArray | null>(null);

let walletClient: any;
export const WalletClientContext = createContext<WalletClient | null>(walletClient);

export type WalletState = {
  eclipseAddr: string;
  setEclipseAddr: React.Dispatch<React.SetStateAction<string>>;
  isValid: boolean | null;
  setIsValid: React.Dispatch<React.SetStateAction<boolean | null>>;
}
export const EclipseWalletContext = createContext<WalletState>({ 
  eclipseAddr: '', 
  setEclipseAddr: () => {},
  isValid: false,
  setIsValid: () => {}
});
