import { useMemo, useContext } from "react";
import { mainnet, sepolia } from "viem/chains";
import { createWalletClient, WalletClient, custom } from 'viem';
import { NetworkContext } from "@/app/contexts/NetworkContext"; 
import { Options } from "@/lib/networkUtils";

export const useWalletClient = (): WalletClient | null => {
  const context = useContext(NetworkContext);

  return useMemo(() => {
    if (typeof window === 'undefined' || !window.ethereum) return null;

    const chain = (context?.selectedOption === Options.Mainnet) ? mainnet : sepolia;

    return createWalletClient({
      chain,
      transport: custom(window.ethereum),
      cacheTime: 0
    });
  }, [context?.selectedOption]);
};

