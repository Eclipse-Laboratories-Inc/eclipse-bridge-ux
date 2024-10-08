import { useEffect, useState } from "react";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { WalletConnectorCore } from "@dynamic-labs/wallet-connector-core";
import { AdaptedWallet, adaptViemWallet } from "@reservoir0x/relay-sdk";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { adaptSolanaWallet } from "@reservoir0x/relay-solana-wallet-adapter";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

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
          if (isSolanaWallet(wallet)) {
            const connection = await (wallet as any).getConnection();
            const signer = await (wallet as any).getSigner();

            adaptedWallet = adaptSolanaWallet(
              wallet.address,
              792703809,
              connection,
              signer.signAndSendTransaction
            );
          } else if (isEthereumWallet(wallet)) {
            const walletClient = await wallet.getWalletClient();
            adaptedWallet = adaptViemWallet(walletClient);
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
