import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { truncateWalletAddress } from "@/lib/stringUtils";
import { ConnectIcon, Chevron } from "../icons";
import ConnectedWallets from "../ConnectedWallets/index";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import { useWallets } from "@/app/hooks/useWallets";

export const ProfileAvatar: React.FC = () => {
  const { evmWallet, solWallet } = useWallets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const openModalRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const ignoreEvmWallet = pathname === "/gas-station";

  const content = useMemo(() => {
    if (!solWallet || (!evmWallet && !ignoreEvmWallet)) {
      return (
        <DynamicConnectButton buttonClassName="connect-button-header">
          {!solWallet && !evmWallet ? "Connect Wallets" : "Connect Wallet"}
        </DynamicConnectButton>
      );
    }
    return truncateWalletAddress(solWallet?.address || "");
  }, [solWallet, evmWallet]);

  const toggleModal = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if ((evmWallet || ignoreEvmWallet || isModalOpen) && solWallet) {
        setIsModalOpen((prevState) => !prevState);
      }
    },
    [evmWallet, isModalOpen, solWallet],
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const modalElement = modalRef.current;
      const openButtonElement = openModalRef.current;

      const clickedOutsideModal =
        modalElement && !modalElement.contains(e.target as Node);
      const clickedOutsideButton =
        openButtonElement && !openButtonElement.contains(e.target as Node);
      if (clickedOutsideModal && clickedOutsideButton) {
        toggleModal();
      }
    },
    [toggleModal],
  );

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, handleClickOutside]);

  useEffect(() => {
    const element = document.querySelector(".main-content") as HTMLElement;
    if (element) {
      if (isModalOpen) {
        element.style.filter = "blur(3px)";
        element.style.overflow = "hidden";
      }
    }

    if (modalRef.current) {
      modalRef.current.className = isModalOpen
        ? "connected-wallets-modal modal-active"
        : "connected-wallets-modal";
    }
  }, [isModalOpen]);

  return (
    <div className="flex items-center space-x-2 p-2">
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
        {solWallet && (evmWallet || ignoreEvmWallet) && <Chevron />}
      </div>
      <ConnectedWallets ref={modalRef} close={toggleModal} />
    </div>
  );
};
