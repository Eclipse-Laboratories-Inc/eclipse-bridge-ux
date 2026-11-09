"use client";

import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { useSidebar } from "@/app/contexts/SidebarContext";
import { EthereumDataProvider } from "@/app/providers/EthereumDataProvider";
import { Options } from "@/lib/networkUtils";
import { useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { ToastContainer } from "react-toastify";
import { ReclaimContent } from "../components/Deposit/ReclaimContent";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { TosClickwrap } from "../components/TosClickwrap";
import { WalletClientContext } from "../context";
import { useWalletClient } from "../hooks";

import "../components/Deposit/styles.css";
import "react-toastify/dist/ReactToastify.min.css";

export default function ReclaimPage() {
  const { isSidebar, setIsSidebar } = useSidebar();
  const [selectedOption, setSelectedOption] = useState(Options.Mainnet);
  const walletClient = useWalletClient();

  return (
    <EthereumDataProvider chain={selectedOption}>
      <NetworkProvider
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      >
        <WalletClientContext.Provider value={walletClient}>
          <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
            <div
              className="flex items-center text-white flex-col justify-between"
              id="main-content"
              style={{
                background: "black",
                transition: "filter 300ms var(--ease-out-quad)",
                height: "100%",
              }}
            >
              <Header isExtended={isSidebar} />
              <TosClickwrap />
              <div
                className="flex flex-row w-full items-center"
                style={{ height: "100%" }}
              >
                <Sidebar isExtended={isSidebar} setIsExtended={setIsSidebar} />
                <div
                  className="flex flex-col items-center"
                  style={{ gap: "13px", flexGrow: "1" }}
                >
                  <div className="main-content flex flex-col gap-2 items-center">
                    <div className="deposit-container flex flex-col">
                      <div className="deposit-card">
                        <ReclaimContent />
                      </div>
                    </div>
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
        </WalletClientContext.Provider>
      </NetworkProvider>
    </EthereumDataProvider>
  );
}
