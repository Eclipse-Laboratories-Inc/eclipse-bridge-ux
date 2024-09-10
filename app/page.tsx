'use client';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Deposit from "./components/deposit";
import ExtendedDetails from './components/ExtendedDetails'
import {
  DynamicConnectButton,
  useUserWallets,
  Wallet
} from "@dynamic-labs/sdk-react-core";
import { truncateWalletAddress } from "@/lib/stringUtils";
import ConnectedWallets from "./components/ConnectedWallets/index";
import { Block, ConnectIcon, Eth, Gas, Chevron } from "./components/icons";
import useEthereumData from "@/lib/ethUtils";
import { EthereumDataContext } from "./context"
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'


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
    if (evmWallet && solWallet) {
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
        <ConnectIcon connectClassName="connect-wallet-icon" /> {content()}
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
    <div className="flex items-center text-white flex flex-col justify-between" id="main-content" style={{
          background: "black", 
          transition: "filter 300ms var(--ease-out-quad)", 
          height: "99.4%"
    }}>
        <Header />
        <div className="main-content flex flex-col gap-2 items-center">
          <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
        </div>
      <footer className="flex items-center">
        <div className="flex flex-row legal-footer justify-center">
          <Link href="https://www.eclipse.xyz/terms"> Terms & Conditions </Link>
          <Link href="https://www.eclipse.xyz/privacy-policy"> Privacy Policy </Link>
          <Link href="https://docs.eclipse.xyz">  Docs </Link>
        </div>
          <div className="flex flex-row info-footer">
          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Gas gasClassName="gas" />  
            <span>Gas</span>
            {gasPrice 
              ? <span style={{color: "rgba(161, 254, 160, 0.5)"}}> ${gasPrice}</span>
              : <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                  <Skeleton height={15} width={58} />
                </SkeletonTheme>
            }
          </div>

          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Eth ethClassName="eth" />
            <span>Eth</span> 
            {ethPrice
              ? <span style={{color: "rgba(161, 254, 160, 0.5)"}}> ${ethPrice}</span>
              : <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                  <Skeleton height={15} width={62} />
                </SkeletonTheme>
            }
          </div>

          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Block blockClassName="block" /> 
            <span>Block</span> 
            {blockNumber 
              ? <span style={{color: "rgba(161, 254, 160, 0.5)"}}> {blockNumber}</span>
              : <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                  <Skeleton height={15} width={67} />
                </SkeletonTheme>
            }
          </div>
        </div>
      </footer>
    </div>
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

