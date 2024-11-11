"use client";
import { ReactNode, useEffect, useState } from "react";
import { http, HttpTransport } from "viem";
import { WagmiProvider as _WagmiProvider, Config, createConfig } from "wagmi";
import { Chain, mainnet } from "wagmi/chains";
import { queryRelayChains } from "@reservoir0x/relay-kit-hooks";
import {
  configureViemChain,
  MAINNET_RELAY_API,
  RelayChain,
} from "@reservoir0x/relay-sdk";
export type ChildrenProps = {
  chains: RelayChain[];
};
type WagmiProviderProps = {
  children: (props: ChildrenProps) => ReactNode;
};
export const WagmiProvider = (props: WagmiProviderProps) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [chains, setChains] = useState<RelayChain[] | null>(null);
  useEffect(() => {
    queryRelayChains(MAINNET_RELAY_API, {}).then((data) => {
      const apiChains =
        data.chains
          ?.map((chain) => configureViemChain(chain as any))
          //filter out solana temporarily
          .filter((chain) => chain.id !== 792703809) ?? [];
      const { wagmiConfig } = createWagmiConfig(
        apiChains
          .filter(({ viemChain }) => viemChain !== undefined)
          .map(({ viemChain }) => viemChain as Chain)
      );
      setConfig(wagmiConfig);
      setChains(apiChains);
    });
  }, []);
  if (!config) {
    return null;
  }
  return (
    <_WagmiProvider config={config}>
      {props.children({ chains: chains ?? [] })}
    </_WagmiProvider>
  );
};
function createWagmiConfig(dynamicChains: Chain[]) {
  const chains = (dynamicChains.length === 0 ? [mainnet] : dynamicChains) as [
    Chain,
    ...Chain[],
  ];
  const wagmiConfig = createConfig({
    chains: chains,
    ssr: true,
    multiInjectedProviderDiscovery: false,
    transports: chains.reduce(
      (transportsConfig: Record<number, HttpTransport>, chain) => {
        //TODO: add alchemy transport if needed
        transportsConfig[chain.id] = http();
        return transportsConfig;
      },
      {}
    ),
  });
  return {
    wagmiConfig,
    chains,
  };
}
