import { createWalletClient, custom } from 'viem';
import config from "@/config";

export const createWalletClientInstance = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: config.currentChain,
      transport: custom(window.ethereum!),
    });
  }
  return null;
};

export const walletClient = createWalletClientInstance();
