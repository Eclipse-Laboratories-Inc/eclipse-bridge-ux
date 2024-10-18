'use client';
import { useState } from "react";
import Deposit from "./components/Deposit";
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TransactionProvider } from './components/TransactionPool';
import useEthereumData from "@/lib/ethUtils";
import { useWalletClient } from "./hooks"
import { 
  EthereumDataContext, 
  WalletClientContext,
  EclipseWalletContext
} from "./context"
import { SkeletonTheme } from 'react-loading-skeleton'

export default function Main() {
  const { gasPrice, ethPrice } = useEthereumData();
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [eclipseAddr, setEclipseAddr] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const walletClient = useWalletClient();

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice]}>
      <WalletClientContext.Provider value={walletClient}>
        <TransactionProvider>
          <EclipseWalletContext.Provider value={{eclipseAddr, setEclipseAddr, isValid, setIsValid}}>
           <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
             <div className="flex items-center text-white flex flex-col justify-between" id="main-content" style={{
               background: "black",
               transition: "filter 300ms var(--ease-out-quad)",
               height: "100%"
             }}>
               <Header />
               { isMobile && <br />} 
               <div className="main-content flex flex-col gap-2 items-center">
                 <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
               </div>
               { isMobile && <br />} 
               <Footer />
             </div>
           </SkeletonTheme>
          </ EclipseWalletContext.Provider>
        </TransactionProvider>
      </WalletClientContext.Provider >
    </ EthereumDataContext.Provider>
  );
}

