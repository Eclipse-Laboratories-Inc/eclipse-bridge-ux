import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import { useMemo, useRef } from "react";

const dynamicStaticAssetUrl =
  "https://iconic.dynamic-static-assets.com/icons/sprite.svg";

export const useLinkedWallets = () => {
  const userWallets = useUserWallets();
  const wallets = useRef<Wallet[]>();

  const linkedWallets = useMemo(() => {
    const _wallets = userWallets.map((wallet) => {
      const walletLogoId =
        // @ts-ignore
        wallet?.connector?.wallet?.brand?.spriteId ?? wallet.key;
      return {
        address: wallet.address,
        walletLogoUrl: `${dynamicStaticAssetUrl}#${walletLogoId}`,
        vmType:
          wallet.chain.toLowerCase() === "evm"
            ? "evm"
            : ("svm" as "evm" | "svm"),
        connector: wallet.connector.key,
      };
    });
    wallets.current = userWallets;
    return _wallets;
  }, [userWallets]);

  return { linkedWallets, wallets };
};
