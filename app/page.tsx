'use client';
import { useEffect, useRef, useState } from "react";
import Deposit from "./components/deposit";
import {
  DynamicConnectButton,
  useUserWallets,
  Wallet
} from "@dynamic-labs/sdk-react-core";
import { truncateWalletAddress } from "@/lib/stringUtils";
import Chevron from "./components/deposit/chevron-right-small";
import ConnectedWallets from "./components/ConnectedWallets/index";

function ProfileAvatar() {
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);


  const content = () => {
    if (!solWallet && !evmWallet) {
      return  (
        <DynamicConnectButton>
        Connect Wallets
        </DynamicConnectButton>
      )
    }
    if (!solWallet || !evmWallet) {
      return  (
        <DynamicConnectButton>
          Connect Wallet
        </DynamicConnectButton>
      )
    }

    return truncateWalletAddress(solWallet?.address || '') 
  };
  //TODO: fix any usage here
  const closeModal = (e: any) => {
    e.stopPropagation();
    setShowModal(false);
  };

  const openModal = (e: any) => {
    e.stopPropagation();
    if (evmWallet && solWallet) {
      setShowModal(true);
    }
  };

  const handleClickOutside = (e: any) => {
    if (modalRef.current && (modalRef.current as HTMLElement).contains(e.target as Node)) {
      setShowModal(false);
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
      <div onClick={(e) => openModal(e)} className="connect-wallet"> 
        {content()}
        <Chevron />
       { showModal && <ConnectedWallets ref={modalRef} close={(e) => closeModal(e)} />}
      </div>
    </div>
  );

}

export default function Main() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white">
      <Header />
      <Deposit /> 
    </div>
  );
}


function Header() {
  return (
    <header className="header w-full bg-black text-green-500 flex items-center justify-between p-4 border-b border-white border-opacity-10">
      <div className="flex items-center space-x-2">
        <img src="/wordmark.png" alt="Eclipse Logo" width={183} height={34} />
      </div>
      <h1 className="text-xl tracking-widest">BRIDGE</h1>
      <>
        <ProfileAvatar />
      </>
    </header>
  );
}