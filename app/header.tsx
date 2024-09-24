'use client';
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  DynamicConnectButton,
  useUserWallets,
  Wallet
} from "@dynamic-labs/sdk-react-core";
import { truncateWalletAddress } from "@/lib/stringUtils";
import { ConnectIcon, Chevron } from "./components/icons";
import ConnectedWallets from "./components/ConnectedWallets/index";

const ProfileAvatar: React.FC = () => {
  const userWallets: Wallet[] = useUserWallets();
  const solWallet = useMemo(() => userWallets.find(w => w.chain === "SOL"), [userWallets]);
  const evmWallet = useMemo(() => userWallets.find(w => w.chain === "EVM"), [userWallets]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const openModalRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if (!solWallet || !evmWallet) {
      return (
        <DynamicConnectButton buttonClassName="connect-button-header">
          {!solWallet && !evmWallet ? "Connect Wallets" : "Connect Wallet"}
        </DynamicConnectButton>
      );
    }
    return truncateWalletAddress(solWallet?.address || '');
  }, [solWallet, evmWallet]);

  const toggleModal = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ((evmWallet || isModalOpen) && solWallet) {
      setIsModalOpen(prevState => !prevState);
    }
  }, [evmWallet, isModalOpen, solWallet]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const modalElement = modalRef.current;
    const openButtonElement = openModalRef.current;
  
    const clickedOutsideModal = modalElement && !modalElement.contains(e.target as Node);
    const clickedOutsideButton = openButtonElement && !openButtonElement.contains(e.target as Node);
    if (clickedOutsideModal && clickedOutsideButton) {
      toggleModal();
    }
  }, [toggleModal]);

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, handleClickOutside]);

  useEffect(() => {
    const element = document.querySelector(".main-content") as HTMLElement;
    if (element) {
      element.style.filter = isModalOpen ? "blur(3px)" : "";
    }

    if (modalRef.current) {
      modalRef.current.className = isModalOpen ? "connected-wallets-modal modal-active" : "connected-wallets-modal";
    }
  }, [isModalOpen]);

  return (
    <div className="flex items-center space-x-2">
      <div 
        onClick={toggleModal} 
        ref={openModalRef} 
        className="connect-wallet"
        role="button"
        aria-haspopup="true"
        aria-expanded={isModalOpen}
      > 
        <ConnectIcon connectClassName="connect-wallet-icon" /> 
        {content}
        {(solWallet && evmWallet) && <Chevron />}
      </div>
      <ConnectedWallets 
        ref={modalRef} 
        close={toggleModal} 
      />
    </div>
  );
};

export const Header: React.FC = () => {
  return (
    <header className="header w-full bg-black text-green-500 flex items-center justify-between p-4 border-b border-white border-opacity-10">
      <div className="flex items-center space-x-2">
        <img src="/wordmark.png" className="desktop-logo" alt="Eclipse Logo" width={183} height={34} />
        <img src="/eclipse-e.png" className="mobile-logo" alt="Eclipse Logo" width={35} height={34} />
      </div>
      <h1 className="text-xl tracking-widest bridge-text">BRIDGE</h1>
      <ProfileAvatar />
    </header>
  );
};
