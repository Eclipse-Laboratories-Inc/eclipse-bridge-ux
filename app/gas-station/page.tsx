'use client';
import { useState } from "react";
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { GasStation } from '../components/GasStation';
import { Footer } from '../components/Footer';
import useEthereumData from "@/lib/ethUtils";
import { useWalletClient } from "../hooks"
import { EthereumDataContext, WalletClientContext } from "../context"
import { useTransactionManager, TMProvider } from "../components/GasStation/TokenManager";
import { useSidebar } from "@/app/contexts/SidebarContext";
import { SkeletonTheme } from 'react-loading-skeleton'

export default function GasStationPage() {
  const { gasPrice, ethPrice } = useEthereumData();
  const { isSidebar, setIsSidebar } = useSidebar();
  const walletClient = useWalletClient();

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice]}>
        <WalletClientContext.Provider value={walletClient}>
          <TMProvider>
            <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
              <div className="flex items-center text-white flex flex-col justify-between" id="main-content" style={{
                background: "black",
                transition: "filter 300ms var(--ease-out-quad)",
                height: "100%"
              }}>
                <Header isExtended={isSidebar} />
                <div className="flex flex-row w-full items-center" style={{height: "100%"}}>
                  <Sidebar isExtended={isSidebar} setIsExtended={setIsSidebar} />
                  <div className="flex flex-col items-center gap-[13px] h-full" style={{ flexGrow: "1"}}>
                    <div className="main-content flex flex-col gap-[65px] items-center h-full justify-center">
                      <GasStation />
                    </div>
                  </div>
                </div>
                <Footer />
              </div>
            </SkeletonTheme>
          </TMProvider>
        </WalletClientContext.Provider >
    </EthereumDataContext.Provider>
  );
}

