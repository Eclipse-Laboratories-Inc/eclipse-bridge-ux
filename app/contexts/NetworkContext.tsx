import { Options, createEthPublicClient } from '@/lib/networkUtils';
import { assertNever } from '@/lib/typeUtils';
import { formatDuration } from '@/lib/activityUtils';
import React, { createContext, useState, useEffect, useRef, ReactNode, useContext, PropsWithChildren } from 'react';
import { CONTRACT_ABI, TREASURY_ABI, TREASURY_DEPOSITOR_ROLE, ECLIPSESCAN_BASE_URL, ETHERSCAN_MAINNET_URL, ETHERSCAN_TESTNET_URL } from '../components/constants';

const BRIDGE_STATE_TTL_MS = 60 * 60 * 1000; // 1 hour

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
  canDeposit: boolean | null; // null while the treasury role check is loading
};

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps extends PropsWithChildren {
  selectedOption: Options;
  setSelectedOption: (network: Options) => void;
}

export const NetworkProvider = ({ selectedOption, setSelectedOption, children }: NetworkProviderProps) => {
  const isMainnet = (selectedOption === Options.Mainnet);
  const bridgeProgram   = isMainnet ? "br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW" : "br1t2MBNdtVRZk3taADwNLt142cVNkekXe1hn3qJVYb"
  const eclipseRpc      = isMainnet ? "https://public-000.eclipserpc.xyz/" : "https://testnet.dev2.eclipsenetwork.xyz"
  const contractAddress = isMainnet ? "0x504392F02ee64D6B51aD3bCf7999E69EBe28b30a" : "0x6f3A89b6cd44b814c35964bb22541EF20D756c33"
  const legacyAddress   = isMainnet ? "0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11" : "0xe49aaa25a10fd6e15dd7ddcb50904ca1e91f6e01" // V1 contract address for backward compatibility
  const relayerAddress  = isMainnet ? "CrfbABN2sSvmoZLu9eDDfXpaC2nHg42R7AXbHs9eg4S9" : "ec1vCnQKsQSnTbcTyc3SH2azcDXZquiFB3QqtRvm3Px"
  const configAccount   = isMainnet ? "B6UA9rd6Qrx9chsrcMWPV3EFnSb1cbnf7AA2wdkhkpqw" : "A3jHKVwNvrvTjnUPGKYei9jbPn7NcraD6H94ewWyfVMY"
  const withdrawApi     = isMainnet ? "https://withdraw.api.prod.eclipse.xyz" : "https://withdraw.api.dev2.eclipsenetwork.xyz"

  // bridge state per network, keyed so a late response can't land on the other network.
  // both bridge reads go out in the same tick, so the client batches them into one multicall.
  const [fraudWindowSeconds, setFraudWindowSeconds] = useState<Partial<Record<Options, number>>>({});
  // undefined while loading; deposits revert if the bridge lacks DEPOSITOR_ROLE on the treasury
  const [depositsEnabled, setDepositsEnabled] = useState<Partial<Record<Options, boolean>>>({});
  // when each read last succeeded; results older than BRIDGE_STATE_TTL_MS are re-read on the next switch to that network
  const checkedAt = useRef<{ fraudWindow: Partial<Record<Options, number>>; deposits: Partial<Record<Options, number>> }>({ fraudWindow: {}, deposits: {} });
  useEffect(() => {
    const network = selectedOption;
    const client = createEthPublicClient(network);
    const bridge = contractAddress as `0x${string}`;
    const isFresh = (t?: number) => t !== undefined && Date.now() - t < BRIDGE_STATE_TTL_MS;

    if (!isFresh(checkedAt.current.fraudWindow[network])) {
      client
        .readContract({ address: bridge, abi: CONTRACT_ABI, functionName: "fraudWindowDuration" })
        .then((seconds) => {
          checkedAt.current.fraudWindow[network] = Date.now();
          setFraudWindowSeconds((prev) => ({ ...prev, [network]: Number(seconds) }));
        })
        .catch((error) => console.error("Failed to read fraudWindowDuration", error));
    }

    // a failed check isn't cached, so switching back to the network retries it
    if (!isFresh(checkedAt.current.deposits[network])) {
      // keep showing an expired result while it refreshes; only show loading when there's none
      if (checkedAt.current.deposits[network] === undefined) {
        setDepositsEnabled((prev) => ({ ...prev, [network]: undefined }));
      }
      client
        .readContract({ address: bridge, abi: CONTRACT_ABI, functionName: "TREASURY" })
        .then((treasury) =>
          client.readContract({
            address: treasury as `0x${string}`,
            abi: TREASURY_ABI,
            functionName: "hasRole",
            args: [TREASURY_DEPOSITOR_ROLE, bridge],
          })
        )
        .then((hasRole) => {
          checkedAt.current.deposits[network] = Date.now();
          setDepositsEnabled((prev) => ({ ...prev, [network]: hasRole }));
        })
        .catch((error) => {
          console.error("Failed to check treasury depositor role", error);
          // fail closed: keep deposits disabled if we can't confirm the role
          setDepositsEnabled((prev) => ({ ...prev, [network]: false }));
        });
    }
  }, [selectedOption, contractAddress]);

  const canDeposit      = depositsEnabled[selectedOption] ?? null
  const fetchedSeconds  = fraudWindowSeconds[selectedOption]
  // fallbacks match the on-chain values at the time of writing
  const waitingPeriod   = fetchedSeconds !== undefined ? formatDuration(fetchedSeconds) : (isMainnet ? "7 days" : "1 day")

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
        waitingPeriod,
        canDeposit
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

