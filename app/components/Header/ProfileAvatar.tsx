import {
  DynamicConnectButton,
} from "@dynamic-labs/sdk-react-core";
import { truncateWalletAddress } from "@/lib/stringUtils";
import { ConnectIcon, Chevron } from "../icons";
import ConnectedWallets from "../ConnectedWallets/index";
import React, { useEffect, useRef, useState, useCallback, useMemo, useContext } from "react";
import { useWallets } from "@/app/hooks/useWallets";
import { EclipseWalletContext } from "@/app/context"

export const ProfileAvatar: React.FC = () => {
  const { evmWallet, solWallet } = useWallets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { eclipseAddr, setEclipseAddr, isValid } = useContext(EclipseWalletContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const openModalRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if ((!solWallet && !eclipseAddr) || !evmWallet) {
      return (
        <DynamicConnectButton buttonClassName="connect-button-header">
          {(!solWallet && (!eclipseAddr || !isValid)) && !evmWallet ? "Connect Wallets" : "Connect Wallet"}
        </DynamicConnectButton>
      );
    }
    return truncateWalletAddress(solWallet?.address || eclipseAddr || '');
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
