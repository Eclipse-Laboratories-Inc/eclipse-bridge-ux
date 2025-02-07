"use client";
import { useState } from "react";
import Deposit from "./components/Deposit";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { TosClickwrap } from "./components/TosClickwrap";
import useEthereumData from "@/lib/ethUtils";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { useWalletClient } from "./hooks";
import { EthereumDataContext, WalletClientContext } from "./context";
import { useSidebar } from "@/app/contexts/SidebarContext";
import { ThirdpartyBridgeModalProvider } from "@/app/components/ThirdpartyBridgeModal/ThirdpartyBridgeModalContext";
import { TransactionProvider } from "./components/TransactionPool";
import { SkeletonTheme } from "react-loading-skeleton";
import { Options } from "@/lib/networkUtils";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.min.css";

export default function Main() {
  const { isSidebar, setIsSidebar } = useSidebar();
  const [selectedOption, setSelectedOption] = useState(Options.Mainnet);
  const { gasPrice, ethPrice, blockNumber } = useEthereumData(selectedOption);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);
  const walletClient = useWalletClient();

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice, blockNumber]}>
      <NetworkProvider selectedOption={selectedOption} setSelectedOption={setSelectedOption}>
        <WalletClientContext.Provider value={walletClient}>
          <TransactionProvider>
            <ThirdpartyBridgeModalProvider>
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

                  <div className="flex flex-row w-full items-center sm:h-full">
                    <Sidebar isExtended={isSidebar} setIsExtended={setIsSidebar} />
                    <div className="flex flex-col items-center" style={{ gap: "13px", flexGrow: "1" }}>
                      <div className="main-content flex flex-col gap-2 items-center">
                        <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
                        <br />
                      </div>
                    </div>
                  </div>
                  <Footer />
                </div>
                <ToastContainer
                  autoClose={3000}
                  closeOnClick={true}
                  hideProgressBar={true}
                  position={"top-center"}
                  toastStyle={{ backgroundColor: "transparent" }}
                  className={"!w-auto"}
                  limit={3}
                />
              </SkeletonTheme>
            </ThirdpartyBridgeModalProvider>
          </TransactionProvider>
        </WalletClientContext.Provider>
      </NetworkProvider>
    </EthereumDataContext.Provider>
  );
}
