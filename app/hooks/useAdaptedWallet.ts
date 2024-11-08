import { useEffect, useState } from "react";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { WalletConnectorCore } from "@dynamic-labs/wallet-connector-core";
import { AdaptedWallet, adaptViemWallet } from "@reservoir0x/relay-sdk";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { adaptSolanaWallet } from "@reservoir0x/relay-svm-wallet-adapter";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { isEclipseWallet } from "@dynamic-labs/eclipse";

export const useAdaptedWalelt = (
  wallet: Wallet<WalletConnectorCore.WalletConnector> | null
) => {
  const [adaptedWallet, setAdaptedWallet] = useState<
    AdaptedWallet | undefined
  >();

  useEffect(() => {
    const adaptWallet = async () => {
      try {
        if (wallet !== null) {
          let adaptedWallet: AdaptedWallet | undefined;
          if (isEthereumWallet(wallet)) {
            const walletClient = await wallet.getWalletClient();
            adaptedWallet = adaptViemWallet(walletClient);
          } else if (isSolanaWallet(wallet) || isEclipseWallet(wallet)) {
            const connection = await (wallet as any).getConnection();
            const signer = await (wallet as any).getSigner();
            const _chainId = isEclipseWallet(wallet) ? 9286185 : 792703809;

            adaptedWallet = adaptSolanaWallet(
              wallet.address,
              _chainId,
              connection,
              signer.signAndSendTransaction
            );
          }
          setAdaptedWallet(adaptedWallet);
        } else {
          setAdaptedWallet(undefined);
        }
      } catch (e) {
        setAdaptedWallet(undefined);
      }
    };
    adaptWallet();
  }, [wallet, wallet?.address]);

  return adaptedWallet;
};
