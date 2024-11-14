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
  relayerAddress: string;
  configAccount: string;
  withdrawApi: string;
  waitingPeriod: string;
};

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOption, setSelectedOption] = useState<Options>(Options.Mainnet);
  const isMainnet = (selectedOption === Options.Mainnet);
  const bridgeProgram   = isMainnet ? "br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW" : "br1t2MBNdtVRZk3taADwNLt142cVNkekXe1hn3qJVYb"
  const eclipseRpc      = isMainnet ? "https://eclipse.helius-rpc.com" : "https://testnet.dev2.eclipsenetwork.xyz"
  const evmExplorer     = isMainnet ? "https://etherscan.io" : "https://sepolia.etherscan.io"
  const eclipseExplorer = isMainnet ? "mainnet" : "testnet"
  const contractAddress = isMainnet ? "0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11" : "0xe49aaa25a10fd6e15dd7ddcb50904ca1e91f6e01"
  const relayerAddress  = isMainnet ? "CrfbABN2sSvmoZLu9eDDfXpaC2nHg42R7AXbHs9eg4S9" : "ec1vCnQKsQSnTbcTyc3SH2azcDXZquiFB3QqtRvm3Px"
  const configAccount   = isMainnet ? "B6UA9rd6Qrx9chsrcMWPV3EFnSb1cbnf7AA2wdkhkpqw" : "A3jHKVwNvrvTjnUPGKYei9jbPn7NcraD6H94ewWyfVMY"
  const withdrawApi     = isMainnet ? "https://withdraw.api.prod.eclipse.xyz" : "https://withdraw.api.dev2.eclipsenetwork.xyz"
  const waitingPeriod   = isMainnet ? "7 days" : "1 day"

  return (
    <NetworkContext.Provider value={{ 
        selectedOption, 
        setSelectedOption, 
        bridgeProgram, 
        eclipseRpc, 
        evmExplorer, 
        eclipseExplorer, 
        contractAddress, 
        relayerAddress, 
        configAccount,
        withdrawApi,
        waitingPeriod
    }}>
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

