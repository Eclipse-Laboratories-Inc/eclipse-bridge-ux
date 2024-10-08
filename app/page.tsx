"use client";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { TransactionProvider } from "./components/TransactionPool";
import useEthereumData from "@/lib/ethUtils";
import {
  useAdaptedWalelt,
  useLinkedWallets,
  useOnLinkNewWallet,
  useOnSetPrimaryWallet,
  useWalletClient,
} from "./hooks";
import { EthereumDataContext, WalletClientContext } from "./context";
import { SkeletonTheme } from "react-loading-skeleton";
import { SwapWidget } from "@reservoir0x/relay-kit-ui";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { zeroAddress } from "viem";

export default function Main() {
  const { gasPrice, ethPrice } = useEthereumData();
  const walletClient = useWalletClient();
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const onLinkNewWallet = useOnLinkNewWallet();
  const { linkedWallets, wallets } = useLinkedWallets();
  const onSetPrimaryWallet = useOnSetPrimaryWallet(wallets.current);
  const wallet = useAdaptedWalelt(primaryWallet);

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice]}>
      <WalletClientContext.Provider value={walletClient}>
        <TransactionProvider>
          <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
            <div
              className="flex items-center text-white flex flex-col justify-between"
              id="main-content"
              style={{
                background: "black",
                transition: "filter 300ms var(--ease-out-quad)",
                height: "100%",
              }}
            >
              <Header />
              <div className="main-content flex flex-col gap-2 items-center">
                <SwapWidget
                  onConnectWallet={() => setShowAuthFlow(true)}
                  // todo: replace with eclipse configs
                  lockChainId={8453}
                  defaultToToken={{
                    address: zeroAddress,
                    chainId: 8453,
                    symbol: "ETH",
                    name: "ETH",
                    decimals: 18,
                    logoURI:
                      "https://assets.relay.link/icons/currencies/eth.png",
                  }}
                  wallet={wallet}
                  multiWalletSupportEnabled={true}
                  linkedWallets={linkedWallets}
                  onLinkNewWallet={(params) => {
                    return onLinkNewWallet(params);
                  }}
                  onSetPrimaryWallet={(address) => {
                    onSetPrimaryWallet(address);
                  }}
                />
                {/* <Deposit amountEther={amountEther} setAmountEther={setAmountEther} /> */}
              </div>
              <Footer />
            </div>
          </SkeletonTheme>
        </TransactionProvider>
      </WalletClientContext.Provider>
    </EthereumDataContext.Provider>
  );
}
