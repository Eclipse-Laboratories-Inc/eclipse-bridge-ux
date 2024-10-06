'use client';
import { useState, useMemo, lazy, Suspense } from "react";
import { TransactionProvider } from './components/TransactionPool';
import useEthereumData from "@/lib/ethUtils";
import { useWalletClient } from "./hooks";
import { EthereumDataContext, WalletClientContext } from "./context";
import { SkeletonTheme } from 'react-loading-skeleton';

const Deposit = lazy(() => import('./components/Deposit')); // Lazy loading
const Header = lazy(() => import('./components/Header')); // Lazy loading
const Footer = lazy(() => import('./components/Footer')); // Lazy loading

export default function Main() {
  const { gasPrice, ethPrice } = useEthereumData();
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);
  const walletClient = useWalletClient();

  // Memoize context values to prevent unnecessary re-renders
  const ethereumDataContextValue = useMemo(() => [gasPrice, ethPrice], [gasPrice, ethPrice]);
  const walletClientContextValue = useMemo(() => walletClient, [walletClient]);

  return (
    <EthereumDataContext.Provider value={ethereumDataContextValue}>
      <WalletClientContext.Provider value={walletClientContextValue}>
        <TransactionProvider>
          <SkeletonTheme baseColor="#FFFFFF0A" highlightColor="#FFFFFF26">
            <div className="main-content-wrapper flex items-center text-white flex-col justify-between" id="main-content">
              {/* Suspense allows you to show a fallback while the component is being lazy loaded */}
              <Suspense fallback={<div>Loading Header...</div>}>
                <Header />
              </Suspense>
              <div className="main-content flex flex-col gap-2 items-center">
                <Suspense fallback={<div>Loading Deposit...</div>}>
                  <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
                </Suspense>
              </div>
              <Suspense fallback={<div>Loading Footer...</div>}>
                <Footer />
              </Suspense>
            </div>
          </SkeletonTheme>
        </TransactionProvider>
      </WalletClientContext.Provider>
    </EthereumDataContext.Provider>
  );
}
