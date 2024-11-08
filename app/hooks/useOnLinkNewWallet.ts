import {
  useDynamicEvents,
  useDynamicModals,
} from "@dynamic-labs/sdk-react-core";
import { LinkedWallet } from "@reservoir0x/relay-kit-ui";
import { RelayChain } from "@reservoir0x/relay-sdk";
import { useState } from "react";

const dynamicStaticAssetUrl =
  "https://iconic.dynamic-static-assets.com/icons/sprite.svg";

export const useOnLinkNewWallet = () => {
  const { setShowLinkNewWalletModal } = useDynamicModals();
  const [linkWalletPromise, setLinkWalletPromise] = useState<
    | {
        resolve: (value: LinkedWallet) => void;
        reject: () => void;
        params: { chain?: RelayChain; direction: "to" | "from" };
      }
    | undefined
  >();

  useDynamicEvents("walletAdded", (newWallet) => {
    if (linkWalletPromise) {
      const walletLogoId =
        // @ts-ignore
        newWallet?.connector?.wallet?.brand?.spriteId ?? newWallet.key;
      const linkedWallet = {
        address: newWallet.address,
        walletLogoUrl: `${dynamicStaticAssetUrl}#${walletLogoId}`,
        vmType:
          newWallet.chain.toLowerCase() === "evm"
            ? "evm"
            : ("svm" as "evm" | "svm"),
        connector: newWallet.key,
      };
      linkWalletPromise.resolve(linkedWallet);
      setLinkWalletPromise(undefined);
    }
  });

  const onLinkNewWallet = ({
    chain,
    direction,
  }: {
    chain?: RelayChain;
    direction: "to" | "from";
  }) => {
    if (linkWalletPromise) {
      linkWalletPromise.reject();
      setLinkWalletPromise(undefined);
    }
    const promise = new Promise<LinkedWallet>((resolve, reject) => {
      setLinkWalletPromise({
        resolve,
        reject,
        params: {
          chain,
          direction,
        },
      });
    });
    setShowLinkNewWalletModal(true);
    return promise;
  };

  return onLinkNewWallet;
};
