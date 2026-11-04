"use client";
import { ReactNode, useEffect, useState } from "react";
import { http, HttpTransport } from "viem";
import { WagmiProvider as _WagmiProvider, Config, createConfig } from "wagmi";
import { Chain, mainnet } from "wagmi/chains";
import { queryRelayChains } from "@relayprotocol/relay-kit-hooks";
import {
  convertViemChainToRelayChain,
  RelayChain,
} from "@relayprotocol/relay-sdk";
import { configureViemChain } from "@relayprotocol/relay-sdk/chain-utils";
import { relayApiUrl } from "@/lib/relay";
export type ChildrenProps = {
  chains: RelayChain[];
};
type WagmiProviderProps = {
  children: (props: ChildrenProps) => ReactNode;
};

const { wagmiConfig: defaultConfig } = createWagmiConfig([mainnet]);

export const WagmiProvider = (props: WagmiProviderProps) => {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [chains, setChains] = useState<RelayChain[]>([
    convertViemChainToRelayChain(mainnet),
  ]);
  useEffect(() => {
    queryRelayChains(relayApiUrl(), {}).then((data) => {
      const eclipseChain = data.chains?.find((chain) => chain.id === 9286185);
      if (eclipseChain) {
        eclipseChain.explorerUrl = "https://eclipsescan.xyz";
      }
      const apiChains =
        data.chains
          ?.map((chain) => configureViemChain(chain as any))
          //filter out solana temporarily
          .filter((chain) => chain.id !== 792703809) ?? [];
      const { wagmiConfig } = createWagmiConfig(
        apiChains
          .filter(({ viemChain }) => viemChain !== undefined)
          .map(({ viemChain }) => viemChain as Chain),
      );
      setConfig(wagmiConfig);
      setChains(apiChains);
    });
  }, []);

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
        if (chain.id === 1) {
          transportsConfig[chain.id] = http(
            "https://empty-responsive-patron.quiknode.pro/91dfa8475605dcdec9afdc8273578c9f349774a1/",
          );
        } else {
          transportsConfig[chain.id] = http();
        }
        return transportsConfig;
      },
      {},
    ),
  });
  return {
    wagmiConfig,
    chains,
  };
}
