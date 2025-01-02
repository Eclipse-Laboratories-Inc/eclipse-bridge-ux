import { useStableSwitchWallet } from "./useStableSwitchWallet";
import { Wallet } from "@dynamic-labs/sdk-react-core";

//In some cases there's a race condition between connecting the wallet and having it available to switch to so we need to poll for it
export const useOnSetPrimaryWallet = (wallets?: Wallet[]) => {
  const switchWallet = useStableSwitchWallet();

  const onSetPrimaryWallet = async (address: string) => {
    const maxAttempts = 20;
    let attemptCount = 0;
    const timer = setInterval(async () => {
      attemptCount++;
      const newPrimaryWallet = wallets?.find(
        (wallet) => wallet.address === address
      );
      if (attemptCount >= maxAttempts) {
        clearInterval(timer);
        return;
      }
      if (!newPrimaryWallet || !switchWallet.current) {
        return;
      }
      try {
        await switchWallet.current(newPrimaryWallet?.id);
        clearInterval(timer);
      } catch (e) {}
    }, 200);
  };

  return onSetPrimaryWallet;
};
