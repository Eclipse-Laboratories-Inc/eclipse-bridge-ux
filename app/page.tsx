'use client';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Deposit from "./components/deposit";
import {
  DynamicConnectButton,
  useUserWallets,
  Wallet
} from "@dynamic-labs/sdk-react-core";
import { truncateWalletAddress } from "@/lib/stringUtils";
import Chevron from "./components/icons/chevron-right-small";
import ConnectedWallets from "./components/ConnectedWallets/index";
import Gas from "./components/icons/gas";
import Eth from "./components/icons/eth";
import Block from "./components/icons/block";
import useEthereumData from "@/lib/ethUtils";

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
  const { blockNumber, gasPrice, ethPrice, error } = useEthereumData()
  console.log({ ethPrice })
  return (
    <div className="flex items-center text-white h-full flex flex-col justify-between">
      <Header />
      <Deposit /> 
      <footer>
        <div className="flex flex-row">
          <Link href="https://www.eclipse.xyz/terms"> Terms & Conditions </Link>
          <Link href="https://www.eclipse.xyz/privacy-policy"> Privacy Policy </Link>
          <Link href="https://docs.eclipse.xyz">  Docs </Link>

        </div>
        <div className="flex flex-row">
          <div className="ml-[28px] flex flex-row"><Gas gasClassName="gas" /> &nbsp; Gas <span style={{color: "rgba(161, 254, 160, 0.5)"}}> &nbsp; ${gasPrice}</span></div>
          <div className="ml-[28px] flex flex-row"><Eth ethClassName="eth" /> &nbsp; Eth <span style={{color: "rgba(161, 254, 160, 0.5)"}}> &nbsp; ${ethPrice}</span> </div>
          <div className="ml-[28px] flex flex-row"><Block blockClassName="block" /> &nbsp; Block <span style={{color: "rgba(161, 254, 160, 0.5)"}}> &nbsp; {blockNumber}</span> </div>
        </div>
      </footer>
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