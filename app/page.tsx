'use client';
import { useState } from "react";
import Deposit from "./components/Deposit";
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TransactionProvider } from './components/TransactionPool';
import { NetworkSwitcher } from "./components/Deposit/NetworkSwitcher";
import useEthereumData from "@/lib/ethUtils";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { useWalletClient } from "./hooks"
import { EthereumDataContext, WalletClientContext } from "./context"
import { SkeletonTheme } from 'react-loading-skeleton'

export default function Main() {
  const { gasPrice, ethPrice } = useEthereumData();
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);
  const walletClient = useWalletClient();

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice]}>
      <NetworkProvider>
        <WalletClientContext.Provider value={walletClient}>
          <TransactionProvider>
            <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
              <div className="flex items-center text-white flex flex-col justify-between" id="main-content" style={{
                background: "black",
                transition: "filter 300ms var(--ease-out-quad)",
                height: "100%"
              }}>
                <Header />
                <div className="flex flex-col items-center" style={{ gap: "13px", width: "100%"}}>
                  <NetworkSwitcher />
                  <div className="main-content flex flex-col gap-2 items-center">
                    <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
                  </div>
                </div>
                <Footer />
              </div>
            </SkeletonTheme>
          </TransactionProvider>
        </WalletClientContext.Provider >
      </NetworkProvider>
    </EthereumDataContext.Provider>
  );
}

