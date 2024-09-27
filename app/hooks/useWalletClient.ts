import { useMemo } from "react";
import { mainnet, sepolia } from "viem/chains";
import { createWalletClient, WalletClient, custom } from 'viem';

export const useWalletClient = (): WalletClient | null => {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.ethereum) return null;

    const chain = process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet" ? mainnet : sepolia;

    return createWalletClient({
      chain,
      transport: custom(window.ethereum),
      cacheTime: 0
    });
  }, []);
};
