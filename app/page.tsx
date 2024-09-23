'use client';
import { mainnet, sepolia } from "viem/chains";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Deposit from "./components/Deposit";
import { TransactionProvider } from '@/app/components/TransactionPool';
import {
  DynamicConnectButton,
  useUserWallets,
  Wallet
} from "@dynamic-labs/sdk-react-core";
import { truncateWalletAddress } from "@/lib/stringUtils";
import ConnectedWallets from "./components/ConnectedWallets/index";
import { Block, ConnectIcon, Eth, Gas, Chevron } from "./components/icons";
import useEthereumData from "@/lib/ethUtils";
import { EthereumDataContext, WalletClientContext } from "./context"
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import MotionNumber from 'motion-number'
import { createWalletClient, custom  } from 'viem';

let walletClient: any;
if (typeof window !== 'undefined' && window.ethereum) {
  walletClient = createWalletClient({
    chain: (process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet") ? mainnet : sepolia,
    transport: custom(window.ethereum!),
    cacheTime: 0
  })
}

function ProfileAvatar() {
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const [showModal, setShowModal] = useState(false);

  const modalRef   = useRef<HTMLDivElement>(null);
  const openModalRef   = useRef<HTMLDivElement>(null);

  const content = () => {
    if (!solWallet || !evmWallet) {
      return  (
        <DynamicConnectButton buttonClassName="connect-button-header">
          { !solWallet && !evmWallet ? "Connect Wallets" : "Connect Wallet"} 
        </DynamicConnectButton>
      )
    }

    return truncateWalletAddress(solWallet?.address || '') 
  };

  //TODO: fix any usage here
  const toggleModal = (e: any) => {
  if (e) e.stopPropagation();
    if ((evmWallet || showModal) && solWallet) {
      const modalState = !showModal;
      setShowModal(modalState);
    
      if (modalRef.current) {
        modalRef.current.className = modalState ? "connected-wallets-modal modal-active" : "connected-wallets-modal";
      }
    
      const element = document.querySelector(".main-content") as HTMLElement;
      element.style.filter = modalState ? "blur(3px)" : "";
    }
  };

  const handleClickOutside = (e: any) => {
    const modalElement = modalRef.current as HTMLElement;
    const openButtonElement = openModalRef.current as HTMLElement;
  
    const clickedOutsideModal = modalElement && !modalElement.contains(e.target as Node);
    const clickedOutsideButton = openButtonElement && !openButtonElement.contains(e.target as Node);

    if (clickedOutsideModal && clickedOutsideButton) {
      toggleModal(null);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  return (
    <div className="flex items-center space-x-2">
      <div onClick={(e) => {toggleModal(e)}} ref={openModalRef} className="connect-wallet"> 
       <ConnectIcon connectClassName="connect-wallet-icon" /> 
        {content()}
        { (solWallet && evmWallet) && <Chevron /> }
      </div>
        { <ConnectedWallets ref={modalRef} close={(e) => toggleModal(e)} />}
    </div>
  );
}

export default function Main() {
  const { blockNumber, gasPrice, ethPrice, error } = useEthereumData();
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
      <footer className="flex items-center" style={{ height: "auto" }}>
        <div className="flex flex-row legal-footer justify-center">
          <Link href="https://www.eclipse.xyz/terms"> Terms & Conditions </Link>
          <Link href="https://www.eclipse.xyz/privacy-policy"> Privacy Policy </Link>
          <Link href="https://docs.eclipse.xyz">  Docs </Link>
          <Link href="https://discord.gg/eclipse-fnd">  Discord </Link>
        </div>
          <div className="flex flex-row info-footer justify-between">
          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Gas gasClassName="gas" />  
            <span>Gas</span>
            {gasPrice 
              ? <span style={{color: "rgba(161, 254, 160, 0.5)"}}> ${gasPrice}</span>
              : <Skeleton height={15} width={58} />
            }
          </div>

          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Eth ethClassName="eth" />
            <span>Eth</span> 
            {ethPrice
              ?  <MotionNumber
                      value={ethPrice}
                      format={{ notation: "standard", style: 'currency', currency: 'USD'}} 
                      style={{
                        color: "rgba(161, 254, 160, 0.5)"
                      }}
                      transition={{
                        y: { type: 'spring', duration: 1, bounce: 0.25 }
                      }}
                      locales="en-US" 
                    />
              : <Skeleton height={15} width={62} />
            }
          </div>

          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Block blockClassName="block" /> 
            <span>Block</span> 
            {blockNumber 
               ? <MotionNumber
                      value={blockNumber}
                      format={{ useGrouping: false }} 
                      style={{
                        color: "rgba(161, 254, 160, 0.5)"
                      }}
                      transition={{
                        y: { type: 'spring', duration: 1, bounce: 0.25 }
                      }}
                      locales="en-US" 
                    />
              : <Skeleton height={15} width={67} />
            }
          </div>
        </div>
      </footer>
    </div>
    </SkeletonTheme>
    </TransactionProvider>
    </WalletClientContext.Provider >
    </ EthereumDataContext.Provider>
  );
}


function Header() {
  return (
    <header className="header w-full bg-black text-green-500 flex items-center justify-between p-4 border-b border-white border-opacity-10">
      <div className="flex items-center space-x-2">
        <img src="/wordmark.png" className="desktop-logo" alt="Eclipse Logo" width={183} height={34} />
        <img src="/eclipse-e.png" className="mobile-logo" alt="Eclipse Logo" width={35} height={34} />
      </div>
      <h1 className="text-xl tracking-widest bridge-text">BRIDGE</h1>
      <>
        <ProfileAvatar />
      </>
    </header>
  );
}

