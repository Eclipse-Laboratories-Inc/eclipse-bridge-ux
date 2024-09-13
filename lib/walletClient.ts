import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

export const createWalletClientInstance = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum!),
    });
  }
  return null;
};

export const walletClient = createWalletClientInstance();
