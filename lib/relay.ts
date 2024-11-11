import { RelayChain } from "@reservoir0x/relay-sdk";
import { GenericNetwork } from "@dynamic-labs/types";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { LinkedWallet } from "@reservoir0x/relay-kit-ui";

const extractWalletIcon = (wallet: Wallet) => {
  const dynamicStaticAssetUrl =
    "https://iconic.dynamic-static-assets.com/icons/sprite.svg";
  //@ts-ignore
  const walletBook = wallet?.connector?.walletBook?.wallets;
  let walletLogoId =
    // @ts-ignore
    wallet?.connector?.wallet?.brand?.spriteId ??
    (walletBook &&
      wallet.key &&
      walletBook[wallet.key] &&
      walletBook[wallet.key].brand &&
      walletBook[wallet.key].brand.spriteId)
      ? walletBook[wallet.key].brand.spriteId
      : undefined;

  // @ts-ignore
  let walletIcon = wallet?.connector?.wallet?.icon;

  if (walletLogoId) {
    return `${dynamicStaticAssetUrl}#${walletLogoId}`;
  } else if (walletIcon) {
    return walletIcon;
  } else {
    return undefined;
  }
};

export const convertRelayChainToDynamicNetwork = (
  chain: RelayChain
): GenericNetwork => {
  return {
    blockExplorerUrls: [chain.explorerUrl ?? "https://etherscan.io"],
    chainId: chain.id,
    chainName: chain.name,
    iconUrls:
      chain.icon?.light || chain.icon?.dark
        ? [chain.icon?.light ?? "", chain.icon?.dark ?? ""]
        : [],
    name: chain.name,
    nativeCurrency: {
      decimals: chain.currency?.decimals ?? 18,
      name: chain.currency?.name ?? "ETH",
      symbol: chain.currency?.symbol ?? "ETH",
    },
    networkId: chain.id,
    rpcUrls: chain.httpRpcUrl ? [chain.httpRpcUrl] : [],
    vanityName: chain.displayName,
  };
};

export const convertToLinkedWallet = (wallet: Wallet): LinkedWallet => {
  const walletIcon = extractWalletIcon(wallet);
  let walletChain = wallet.chain.toLowerCase();
  let vmType: "evm" | "svm" | "bvm" = "evm";

  if (walletChain === "sol" || walletChain === "eclipse") {
    vmType = "svm";
  } else if (walletChain === "btc") {
    vmType = "bvm";
  }

  const address =
    wallet.additionalAddresses.find((address) => address.type !== "ordinals")
      ?.address ?? wallet.address;

  return {
    address,
    walletLogoUrl: walletIcon,
    vmType,
    connector: wallet.connector.key,
  };
};
