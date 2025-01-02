import { useSwitchWallet } from "@dynamic-labs/sdk-react-core";
import { useEffect, useRef } from "react";

// This hook ensures that switchWallets is always up to date with the latest function from dynamic
export const useStableSwitchWallet = () => {
  const switchWallet = useRef<(walletId: string) => Promise<void>>();
  const _switchWallet = useSwitchWallet();

  useEffect(() => {
    switchWallet.current = _switchWallet;
  }, [_switchWallet]);

  return switchWallet;
};
