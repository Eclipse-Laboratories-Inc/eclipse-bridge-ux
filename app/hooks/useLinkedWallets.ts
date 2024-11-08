import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import { LinkedWallet } from "@reservoir0x/relay-kit-ui";
import { useMemo, useRef } from "react";

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

const convertToLinkedWallet = (wallet: Wallet): LinkedWallet => {
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

export const useLinkedWallets = () => {
  const userWallets = useUserWallets();
  const wallets = useRef<Wallet<any>[]>();
  console.log(userWallets);
  const linkedWallets = useMemo(() => {
    const _wallets = userWallets.reduce(
      (linkedWallets, wallet) => {
        linkedWallets.push(convertToLinkedWallet(wallet));
        return linkedWallets;
      },
      [] as ReturnType<typeof convertToLinkedWallet>[]
    );
    wallets.current = userWallets;
    return _wallets;
  }, [userWallets]);

  return { linkedWallets, wallets };
};
