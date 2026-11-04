import { MAINNET_RELAY_API, RelayChain } from "@relayprotocol/relay-sdk";
import { GenericNetwork } from "@dynamic-labs/types";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { LinkedWallet } from "@relayprotocol/relay-kit-ui";
import { queryRequests } from "@relayprotocol/relay-kit-hooks";

// Relay API calls go through our proxy (app/api/relay), which adds the API key.
// Must be absolute: relay-sdk builds some URLs with `new URL(baseApiUrl + path)`.
export const relayApiUrl = () =>
  typeof window !== "undefined"
    ? `${window.location.origin}/api/relay`
    : MAINNET_RELAY_API;

const extractWalletIcon = (wallet: Wallet) => {
  const dynamicStaticAssetUrl =
    "https://iconic.dynamic-static-assets.com/icons/sprite.svg";
  //@ts-ignore
  const walletBook = wallet?.connector?.walletBook?.wallets;
  let walletLogoId =
    // @ts-ignore
    (wallet?.connector?.wallet?.brand?.spriteId ??
    (walletBook &&
      wallet.key &&
      walletBook[wallet.key] &&
      walletBook[wallet.key].brand &&
      walletBook[wallet.key].brand.spriteId))
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
  chain: RelayChain,
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
    key: chain.name,
    isTestnet: false,
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

export type RelayRequest = NonNullable<
  Awaited<ReturnType<typeof queryRequests>>["requests"]
>[number];

// GET /requests/v3 dropped v2's metadata.currencyIn/currencyOut and flat
// gas/price fees: currencies now live under route, fees are split by component.
// `actual` is filled once the request settles; fall back to the quote before that.
export const summarizeRelayRequest = (request: RelayRequest) => {
  const route = request.data?.route?.actual ?? request.data?.route?.quoted;
  const fees = request.data?.fees?.actual ?? request.data?.fees?.quoted;
  const feeCurrency = request.data?.fees?.currency;
  const feeComponents = [fees?.execution, fees?.swap, fees?.platform, fees?.app];

  return {
    currencyIn: route?.origin?.inputCurrency,
    currencyOut: route?.destination?.outputCurrency,
    feeCurrency,
    feeAmount: feeComponents.reduce(
      (sum, c) => sum + Number(c?.amount ?? 0) / 10 ** (feeCurrency?.decimals ?? 18),
      0,
    ),
    feeUsd: feeComponents.reduce((sum, c) => sum + Number(c?.usd ?? 0), 0),
  };
};
