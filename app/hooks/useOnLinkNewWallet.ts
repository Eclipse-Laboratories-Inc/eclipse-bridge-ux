import { useWalletFilter } from "@/app/hooks/useWalletContext";
import { convertToLinkedWallet } from "@/lib/relay";
import {
  useDynamicEvents,
  useDynamicModals,
} from "@dynamic-labs/sdk-react-core";
import { LinkedWallet } from "@reservoir0x/relay-kit-ui";
import { RelayChain } from "@reservoir0x/relay-sdk";
import { useState } from "react";

export const useOnLinkNewWallet = () => {
  const { setShowLinkNewWalletModal } = useDynamicModals();
  const { setWalletFilter } = useWalletFilter();
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
      linkWalletPromise.resolve(convertToLinkedWallet(newWallet));
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
    if (chain?.vmType === "evm") {
      setWalletFilter("EVM");
    } else if (chain?.id === 792703809) {
      setWalletFilter("SOL");
    } else if (chain?.id === 8253038) {
      setWalletFilter("BTC");
    } else if (chain?.id === 9286185) {
      setWalletFilter("ECLIPSE");
    } else {
      setWalletFilter(undefined);
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
