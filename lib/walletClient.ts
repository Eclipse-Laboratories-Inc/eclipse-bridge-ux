import { createWalletClient, custom } from 'viem';
import { mainnet, sepolia } from "viem/chains";

export const createWalletClientInstance = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: (process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet") ? mainnet : sepolia,
      transport: custom(window.ethereum!),
    });
  }
  return null;
};

export const walletClient = createWalletClientInstance();
