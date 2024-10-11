'use client';
import { useState } from "react";
import Deposit from "./components/Deposit";
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import useEthereumData from "@/lib/ethUtils";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { useWalletClient } from "./hooks"
import { EthereumDataContext, WalletClientContext } from "./context"
import { SkeletonTheme } from 'react-loading-skeleton'

export default function Main() {
  const { gasPrice, ethPrice } = useEthereumData();
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);
  const [isSidebar, setIsSidebar] = useState(true);
  const walletClient = useWalletClient();

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice]}>
      <NetworkProvider>
        <WalletClientContext.Provider value={walletClient}>
            <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
              <div className="flex items-center text-white flex flex-col justify-between" id="main-content" style={{
                background: "black",
                transition: "filter 300ms var(--ease-out-quad)",
                height: "100%"
              }}>
                <Header isExtended={isSidebar} />
                <div className="flex flex-row w-full items-center" style={{height: "100%"}}>
                  <Sidebar isExtended={isSidebar} setIsExtended={setIsSidebar} />
                  <div className="flex flex-col items-center" style={{ gap: "13px", flexGrow: "1"}}>
                    <div className="main-content flex flex-col gap-2 items-center">
                      <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
                    </div>
                  </div>
                </div>
                <Footer />
              </div>
            </SkeletonTheme>
        </WalletClientContext.Provider >
      </NetworkProvider>
    </EthereumDataContext.Provider>
  );
}

