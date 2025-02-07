"use client";
import React from "react";

import "./styles.css";
import { SwapWidget } from "@reservoir0x/relay-kit-ui";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useLinkedWallets } from "@/app/hooks/useLinkedWallets";
import { useOnLinkNewWallet } from "@/app/hooks/useOnLinkNewWallet";
import { useOnSetPrimaryWallet } from "@/app/hooks/useOnSetPrimaryWallet";
import { useAdaptedWallet } from "@/app/hooks/useAdaptedWallet";

export interface RelaySwapWidgetContentProps {}

export const RelaySwapWidget: React.FC<RelaySwapWidgetContentProps> = ({}) => {
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const { linkedWallets, wallets } = useLinkedWallets();
  const onLinkNewWallet = useOnLinkNewWallet();
  const onSetPrimaryWallet = useOnSetPrimaryWallet(wallets.current);
  const wallet = useAdaptedWallet(primaryWallet);

  return (
    <SwapWidget
      onConnectWallet={() => setShowAuthFlow(true)}
      // todo: replace with eclipse configs
      lockChainId={9286185}
      defaultFromToken={{
        address: "0x0000000000000000000000000000000000000000",
        chainId: 1,
        symbol: "ETH",
        name: "ETH",
        decimals: 18,
        logoURI: "https://assets.relay.link/icons/currencies/eth.png",
      }}
      defaultToToken={{
        address: "11111111111111111111111111111111",
        chainId: 9286185,
        symbol: "ETH",
        name: "ETH",
        decimals: 9,
        logoURI: "https://assets.relay.link/icons/currencies/eth.png",
      }}
      wallet={wallet}
      multiWalletSupportEnabled={true}
      linkedWallets={linkedWallets}
      onLinkNewWallet={(params) => {
        return onLinkNewWallet(params);
      }}
      onSetPrimaryWallet={(address) => {
        onSetPrimaryWallet(address);
      }}
    />
  );
};
