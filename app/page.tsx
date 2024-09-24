'use client';
import { mainnet, sepolia } from "viem/chains";
import { useState } from "react";
import Deposit from "./components/Deposit";
import { TransactionProvider } from '@/app/components/TransactionPool';
import { Header } from "./header"
import { Footer } from "./footer"
import useEthereumData from "@/lib/ethUtils";
import { EthereumDataContext, WalletClientContext } from "./context"
import { SkeletonTheme } from 'react-loading-skeleton'
import { createWalletClient, custom  } from 'viem';

let walletClient: any;
if (typeof window !== 'undefined' && window.ethereum) {
  walletClient = createWalletClient({
    chain: (process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet") ? mainnet : sepolia,
    transport: custom(window.ethereum!),
    cacheTime: 0
  })
}

export default function Main() {
  const { gasPrice, ethPrice } = useEthereumData();
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice]}>
      <WalletClientContext.Provider value={walletClient}>
        <TransactionProvider>
          <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
            <div className="flex items-center text-white flex flex-col justify-between" id="main-content" style={{
                  background: "black", 
                  transition: "filter 300ms var(--ease-out-quad)", 
                  height: "100%"
            }}>
                <Header />
                <div className="main-content flex flex-col gap-2 items-center">
                  <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
                </div>
                <Footer />
            </div>
          </SkeletonTheme>
        </TransactionProvider>
      </WalletClientContext.Provider >
    </ EthereumDataContext.Provider>
  );
}

