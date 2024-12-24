import { convertToLinkedWallet } from "@/lib/relay";
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import { useMemo, useRef } from "react";

export const useLinkedWallets = () => {
  const userWallets = useUserWallets();
  const wallets = useRef<Wallet<any>[]>();

  const linkedWallets = useMemo(() => {
    const _wallets = userWallets.reduce(
      (linkedWallets, wallet) => {
        linkedWallets.push(convertToLinkedWallet(wallet));
        return linkedWallets;
      },
      [] as ReturnType<typeof convertToLinkedWallet>[],
    );
    wallets.current = userWallets;
    return _wallets;
  }, [userWallets]);

  return { linkedWallets, wallets };
};
