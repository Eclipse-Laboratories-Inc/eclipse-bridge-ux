import React, { useState, useEffect, useRef } from 'react';
import { Options, useNetwork } from "@/app/contexts/NetworkContext"; 
import { Chevron } from "../icons";
import "./NetworkSwitcher.css";
import { useWallets } from "@/app/hooks/useWallets";

export const NetworkSwitcher: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedOption, setSelectedOption } = useNetwork();
  const [localSelected, setLocalSelected] = useState<Options>(Options.Mainnet);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { evmWallet } = useWallets();

  useEffect(() => {
    const switchChain = async (cid: number) => { 
      if (evmWallet?.connector.supportsNetworkSwitching()) {
        try { 
          await evmWallet?.connector.switchNetwork({ networkChainId: cid });
          setSelectedOption(localSelected);
        } catch { 
          console.log("p 1")
        };
      } else {
          console.log("p 2")
      };
    }

    const chainId = (localSelected === Options.Mainnet) ? 1 : 11155111; 
    switchChain(chainId);
    console.log("SWITCHHHH44")
    console.log(evmWallet)
  }, [localSelected, evmWallet]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(!isModalOpen);
      }
    };
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside); 
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div className="switcher-main flex flex-col items-center" ref={modalRef}>
      <div onClick={() => setIsModalOpen(!isModalOpen)} className="net-switcher flex flex-row items-center justify-center">
        <span>{localSelected}</span>
        <Chevron />
      </div>

      {isModalOpen && (
        <div className="network-options flex flex-col" hidden={!isModalOpen}>
          {Object.values(Options).map((option) => (
            <div key={option} onClick={() => { setLocalSelected(option); setIsModalOpen(!isModalOpen) }}>
              {option}
            </div>
          ))}
        </div>
      )}
    </div> 
  );
}
