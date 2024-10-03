import React, { useState, useEffect, useRef } from 'react';
import { Options, useNetwork } from "@/app/contexts/NetworkContext"; 
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Chevron } from "../icons";
import "./NetworkSwitcher.css";

export const NetworkSwitcher: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedOption, setSelectedOption } = useNetwork();
  const previousOption = useRef<Options>(selectedOption);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { walletConnector } = useDynamicContext();

  useEffect(() => {
    const switchChain = async (cid: number) => { 
      if (walletConnector?.supportsNetworkSwitching()) {
        try { 
          await walletConnector.switchNetwork({ networkChainId: cid });
          previousOption.current = selectedOption;
        } catch { 
          setSelectedOption(previousOption.current);
        };
      } else {
          setSelectedOption(previousOption.current);
      };
    }

    const chainId = selectedOption === Options.Mainnet ? 1 : 11155111; 
    switchChain(chainId);
  }, [selectedOption]);

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
        <span>{selectedOption}</span>
        <Chevron />
      </div>

      {isModalOpen && (
        <div className="network-options flex flex-col" hidden={!isModalOpen}>
          {Object.values(Options).map((option) => (
            <div key={option} onClick={() => { setSelectedOption(option); setIsModalOpen(!isModalOpen) }}>
              {option}
            </div>
          ))}
        </div>
      )}
    </div> 
  );
}
