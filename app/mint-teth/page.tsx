"use client";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { useSidebar } from "@/app/contexts/SidebarContext";
import useEthereumData from "@/lib/ethUtils";
import { useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { TosClickwrap } from "../components/TosClickwrap";
import Mint from "./components/Mint";
import { Sidebar } from "../components/Sidebar";
import { TransactionProvider } from "../components/TransactionPool";
import { EthereumDataContext, WalletClientContext } from "../context";
import { useWalletClient } from "../hooks";
import { Options } from "@/lib/networkUtils";

export default function Main() {
  const { isSidebar, setIsSidebar } = useSidebar();
  const [selectedOption, setSelectedOption] = useState(Options.Mainnet)
  const { gasPrice, ethPrice, blockNumber } = useEthereumData(selectedOption);
  const walletClient = useWalletClient();

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice, blockNumber]}>
      <NetworkProvider selectedOption={selectedOption} setSelectedOption={setSelectedOption}>
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
                <Header isExtended={isSidebar} />
                <TosClickwrap /> 
                <div className="flex flex-row w-full items-center" style={{ height: "100%" }}>
                  <Sidebar isExtended={isSidebar} setIsExtended={setIsSidebar} />
                  <div className="flex flex-col items-center" style={{ gap: "13px", flexGrow: "1" }}>
                    <div className="main-content flex flex-col gap-2 items-center">
                      <Mint />
                    </div>
                  </div>
                </div>
                <Footer />
              </div>
            </SkeletonTheme>
          </TransactionProvider>
        </WalletClientContext.Provider>
      </NetworkProvider>
    </EthereumDataContext.Provider>
  );
}
