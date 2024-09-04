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

function ProfileAvatar() {
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const [showModal, setShowModal] = useState(false);

  const modalRef   = useRef<HTMLDivElement>(null);
  const openModalRef   = useRef<HTMLDivElement>(null);
  const depositRef = useRef<HTMLDivElement>(null);


  // TODO: need some refactor here
  const content = () => {
    if (!solWallet && !evmWallet) {
      return  (
          <DynamicConnectButton buttonClassName="connect-button-header">
            Connect Wallets
          </DynamicConnectButton>
      )
    }
    if (!solWallet || !evmWallet) {
      return  (
        <DynamicConnectButton buttonClassName="connect-button-header">
          Connect Wallet
        </DynamicConnectButton>
      )
    }

    return truncateWalletAddress(solWallet?.address || '') 
  };

  //TODO: fix any usage here
  const closeModal = (e: any) => {
    if (e) e.stopPropagation();
    if (modalRef.current) modalRef.current.className = "connected-wallets-modal"
    setShowModal(!showModal);
    console.log(showModal)
    
    // remove blur effect
    const element = document.querySelector(".main-content") as HTMLElement;
    element.style.filter = ""
  };

  const openModal = (e: any) => {
    if (e) e.stopPropagation();
    if (evmWallet && solWallet) {
      if (modalRef.current) modalRef.current.className = "connected-wallets-modal modal-active"
      setShowModal(!showModal);
      console.log(showModal)
      // add blur 
      const element = document.querySelector(".main-content") as HTMLElement;
      element.style.filter = "blur(3px)"
    }
  };

  const handleClickOutside = (e: any) => {
    const modalElement = modalRef.current as HTMLElement;
    const openButtonElement = openModalRef.current as HTMLElement;
  
    const clickedOutsideModal = modalElement && !modalElement.contains(e.target as Node);
    const clickedOutsideButton = openButtonElement && !openButtonElement.contains(e.target as Node);

    if (clickedOutsideModal && clickedOutsideButton) {
      closeModal(null);
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
      <div onClick={(e) => {(!showModal) ? openModal(e) : closeModal(e)}} ref={openModalRef} className="connect-wallet"> 
        <ConnectIcon connectClassName="connect-wallet-icon" /> {content()}
        { (solWallet && evmWallet) && <Chevron /> }
      </div>
        { <ConnectedWallets ref={modalRef} close={(e) => closeModal(e)} />}
    </div>
  );

}

export default function Main() {
  const { blockNumber, gasPrice, ethPrice, error } = useEthereumData();
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);

  return (
    <EthereumDataContext.Provider value={[gasPrice, ethPrice]}>
    <div className="flex items-center text-white h-full flex flex-col justify-between" id="main-content" style={{
          background: "black", 
          transition: "filter 300ms var(--ease-out-quad)" 
    }}>
        <Header />
        <div className="main-content flex flex-col gap-2 items-center">
          <Deposit amountEther={amountEther} setAmountEther={setAmountEther} />
          <br></br>
          <ExtendedDetails amountEther={amountEther} />
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
            <span style={{color: "rgba(161, 254, 160, 0.5)"}}> ${gasPrice}</span>
          </div>

          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Eth ethClassName="eth" />
            <span>Eth</span> 
            <span style={{color: "rgba(161, 254, 160, 0.5)"}}> ${ethPrice}</span>
          </div>

          <div className="ml-[28px] flex flex-row items-center gap-2">
            <Block blockClassName="block" /> 
            <span>Block</span> 
            <span style={{color: "rgba(161, 254, 160, 0.5)"}}> {blockNumber}</span>
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
      { (window.innerWidth >= 768) 
        ? <img src="/wordmark.png" alt="Eclipse Logo" width={183} height={34} />
        : <img src="/eclipse-e.png" alt="Eclipse Logo" width={35} height={34} />
      }
      </div>
      <h1 className="text-xl tracking-widest bridge-text">BRIDGE</h1>
      <>
        <ProfileAvatar />
      </>
    </header>
  );
}
