'use client';
import { useState } from "react";
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { GasStation } from '../components/GasStation';
import { Footer } from '../components/Footer';
import useEthereumData from "@/lib/ethUtils";
import { TosClickwrap } from "../components/TosClickwrap";
import { useWalletClient } from "../hooks"
import { EthereumDataContext, WalletClientContext } from "../context"
import { useTransactionManager, TMProvider } from "../components/GasStation/TokenManager";
import { useSidebar } from "@/app/contexts/SidebarContext";
import { SkeletonTheme } from 'react-loading-skeleton'
import { Options } from "@/lib/networkUtils";
import { NetworkProvider } from "../contexts/NetworkContext";
import {ToastContainer} from 'react-toastify'

import "react-toastify/dist/ReactToastify.min.css";

export default function GasStationPage() {
  const [selectedOption, setSelectedOption] = useState(Options.Mainnet)
  const { gasPrice, ethPrice, blockNumber } = useEthereumData(selectedOption);
  const { isSidebar, setIsSidebar } = useSidebar();
  const walletClient = useWalletClient();

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice, blockNumber]}>
        <NetworkProvider selectedOption={selectedOption} setSelectedOption={setSelectedOption}>
          <WalletClientContext.Provider value={walletClient}>
            <TMProvider>
              <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
                <div className="flex items-center text-white flex flex-col justify-between" id="main-content" style={{
                  background: "black",
                  transition: "filter 300ms var(--ease-out-quad)",
                  height: "100%"
                }}>
                  <Header isExtended={isSidebar} />
                  <TosClickwrap />

                  <div className="flex flex-row w-full items-center" style={{height: "100%"}}>
                    <Sidebar isExtended={isSidebar} setIsExtended={setIsSidebar} />
                    <div className="flex flex-col items-center gap-[13px]" style={{ flexGrow: "1"}}>
                      <div className="main-content flex flex-col gap-[65px] items-center h-full justify-center">
                        <GasStation />
                      </div>
                    </div>
                  </div>
                  <Footer />
                </div>
                <ToastContainer
                  autoClose={3000}
                  closeOnClick={true}
                  hideProgressBar={true}
                  position={'top-center'}
                  toastStyle={{backgroundColor: 'transparent'}}
                  className={'!w-auto'}
                  limit={3}
                />
              </SkeletonTheme>
            </TMProvider>
          </WalletClientContext.Provider >
        </NetworkProvider>
    </EthereumDataContext.Provider>
  );
}
