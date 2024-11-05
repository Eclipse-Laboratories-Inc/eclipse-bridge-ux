"use client"

import React, { createContext, useState, ReactNode, useContext } from 'react';

export enum Options {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet',
}

type NetworkContextType = {
  selectedOption: Options;
  setSelectedOption: (network: Options) => void;
  bridgeProgram: string;
  eclipseRpc: string;
  evmExplorer: string;
  eclipseExplorer: string;
  contractAddress: string;
};

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOption, setSelectedOption] = useState<Options>(Options.Mainnet);
  const isMainnet = (selectedOption === Options.Mainnet);
  const bridgeProgram   = isMainnet ? "br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW" : "br1t2MBNdtVRZk3taADwNLt142cVNkekXe1hn3qJVYb"
  const eclipseRpc      = isMainnet ? "https://mainnetbeta-rpc.eclipse.xyz" : "https://testnet.dev2.eclipsenetwork.xyz"
  const evmExplorer     = isMainnet ? "https://etherscan.io" : "https://sepolia.etherscan.io"
  const eclipseExplorer = isMainnet ? "mainnet" : "testnet"
  const contractAddress = isMainnet ? "0x83cB71D80078bf670b3EfeC6AD9E5E6407cD0fd1" : "0xe49aaa25a10fd6e15dd7ddcb50904ca1e91f6e01"

  return (
    <NetworkContext.Provider value={{ selectedOption, setSelectedOption, bridgeProgram, eclipseRpc, evmExplorer, eclipseExplorer, contractAddress}}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

