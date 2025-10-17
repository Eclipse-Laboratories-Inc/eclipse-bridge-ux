import { Options } from '@/lib/networkUtils';
import { assertNever } from '@/lib/typeUtils';
import React, { createContext, useState, ReactNode, useContext, PropsWithChildren } from 'react';
import { ECLIPSESCAN_BASE_URL, ETHERSCAN_MAINNET_URL, ETHERSCAN_TESTNET_URL } from '../components/constants';

export function composeEclipsescanUrl(network: Options, path: string = '/'): string {
  let targetNetwork: string;
  switch (network) {
    case Options.Mainnet:
        targetNetwork = 'mainnet'
        break
    case Options.Testnet:
        targetNetwork = 'testnet'
        break
    default:
        return assertNever(network)
  }


  return `${ECLIPSESCAN_BASE_URL}${path}?cluster=${targetNetwork}`
}

export function composeEtherscanUrl(network: Options, path: string = '/'): string {
  let url: string
  switch (network) {
    case Options.Mainnet: {
      url = ETHERSCAN_MAINNET_URL
      break
    }
    case Options.Testnet: {
      url = ETHERSCAN_TESTNET_URL
      break
    }
    default:
      return assertNever(network)
  }

  return `${url}${path}`
}

export function composeEtherscanCompatibleTxPath(txHash: string): string {
  return `/tx/${txHash}`
}

type NetworkContextType = {
  selectedOption: Options;
  setSelectedOption: (network: Options) => void;
  bridgeProgram: string;
  eclipseRpc: string;
  contractAddress: string;
  legacyAddress: string; // V1 contract address for backward compatibility
  relayerAddress: string;
  configAccount: string;
  withdrawApi: string;
  waitingPeriod: string;
};

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps extends PropsWithChildren {
  selectedOption: Options;
  setSelectedOption: (network: Options) => void;
}

export const NetworkProvider = ({ selectedOption, setSelectedOption, children }: NetworkProviderProps) => {
  const isMainnet = (selectedOption === Options.Mainnet);
  const bridgeProgram   = isMainnet ? "br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW" : "br1t2MBNdtVRZk3taADwNLt142cVNkekXe1hn3qJVYb"
  const eclipseRpc      = isMainnet ? "https://eclipse.lgns.net/" : "https://testnet.dev2.eclipsenetwork.xyz"
  const contractAddress = isMainnet ? "0x867A8FcD5Bb6774d4d37fb342D669A35FF789a51" : "0x19A021249e79bb3e62Ee9fCe0745d9619fCEAeCb"
  const legacyAddress   = isMainnet ? "0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11" : "0xe49aaa25a10fd6e15dd7ddcb50904ca1e91f6e01" // V1 contract address for backward compatibility
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
        contractAddress,
        legacyAddress,
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

