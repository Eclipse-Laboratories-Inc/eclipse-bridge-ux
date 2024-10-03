"use client"

import React, { createContext, useState, ReactNode, useContext } from 'react';

export enum Options {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet',
  Devnet = 'Thirdparty',
}

type NetworkContextType = {
  selectedOption: Options;
  setSelectedOption: (network: Options) => void;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOption, setSelectedOption] = useState<Options>(Options.Mainnet);

  return (
    <NetworkContext.Provider value={{ selectedOption, setSelectedOption }}>
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

