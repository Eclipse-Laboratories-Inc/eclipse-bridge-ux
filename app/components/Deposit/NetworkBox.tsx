"use client";
import React, { useState, useEffect, useRef } from 'react';

import './styles.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { Cross, ConnectIcon } from "../icons";

import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";

import { truncateWalletAddress } from '@/lib/stringUtils';
import { useWallets } from "@/app/hooks/useWallets";
import { handleClientScriptLoad } from 'next/script';

export interface NetworkBoxProps {
  imageSrc: string;
  direction: string;
  chainName: string;
  onClickEvent: () => void;
  walletChain: "EVM" | "SOL";
  showConnect: boolean;
  wallet: any;
}

const validIcon: React.FC = () => {
  return (
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="0.5" width="17" height="17" rx="8.5" fill="#A1FEA0" fill-opacity="0.1"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 2.5C4.91015 2.5 2 5.41015 2 9C2 12.5898 4.91015 15.5 8.5 15.5C12.0898 15.5 15 12.5898 15 9C15 5.41015 12.0898 2.5 8.5 2.5ZM10.9531 7.78664C11.1804 7.50878 11.1395 7.09927 10.8616 6.87195C10.5838 6.64463 10.1743 6.68558 9.9469 6.96341L7.47677 9.98254L6.68462 9.19038C6.43078 8.93656 6.01922 8.93656 5.76538 9.19038C5.51154 9.44421 5.51154 9.85579 5.76538 10.1096L7.06538 11.4096C7.19524 11.5395 7.37394 11.6084 7.55737 11.5992C7.7408 11.5901 7.91175 11.5037 8.0281 11.3616L10.9531 7.78664Z" fill="#A1FEA0"/>
    </svg>
  );
}

const invalidIcon: React.FC = () => {
  return (
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="0.5" width="17" height="17" rx="8.5" fill="#A1FEA0" fill-opacity="0.1"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M3.08398 9.00016C3.08398 6.00862 5.50911 3.5835 8.50065 3.5835C11.4922 3.5835 13.9173 6.00862 13.9173 9.00016C13.9173 11.9917 11.4922 14.4168 8.50065 14.4168C5.50911 14.4168 3.08398 11.9917 3.08398 9.00016ZM7.25867 6.99214C7.04713 6.78061 6.70417 6.78061 6.49263 6.99214C6.2811 7.20368 6.2811 7.54664 6.49263 7.75818L7.73463 9.00016L6.49263 10.2421C6.2811 10.4537 6.2811 10.7967 6.49263 11.0082C6.70417 11.2197 7.04713 11.2197 7.25867 11.0082L8.50065 9.76619L9.74264 11.0082C9.95416 11.2197 10.2971 11.2197 10.5087 11.0082C10.7202 10.7967 10.7202 10.4537 10.5087 10.2421L9.26668 9.00016L10.5087 7.75818C10.7202 7.54664 10.7202 7.20368 10.5087 6.99214C10.2971 6.78061 9.95416 6.78061 9.74264 6.99214L8.50065 8.23414L7.25867 6.99214Z" fill="#EB4D4D"/>
    </svg>
  )
}

export const NetworkBox: React.FC<NetworkBoxProps> = ({ imageSrc, direction, chainName, onClickEvent, walletChain, showConnect, wallet }) => {
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [eclipseAddr, setEclipseAddr] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { userWallets } = useWallets();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEclipseAddr(event.target.value);
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        alert("giro")
        // Modern browsers
        const text = await navigator.clipboard.readText();
        alert(text)
        setEclipseAddr(text);
      } else {
        // Fallback for older browsers or mobile
        throw new Error('Clipboard API not supported');
      }
    } catch (err) {
      inputRef.current?.focus();
      const z = document.execCommand('paste')
      alert(z)
    }
  };

  useEffect(() => {
    
  }, [eclipseAddr])

  return (
    <div className="network-box flex-col">
      <div className="network-info flex items-center justify-center">
        <div className='network-info-left-section flex items-center justify-center'>
          <img src={imageSrc} alt="" style={{ objectFit: "cover", height: "44px", width: "44px"}} />
          <div className="input-inner-container">
            <span className="direction">{direction}</span>
            <span className="name">{chainName}</span>
          </div>
        </div>
        {wallet && <div className="network-info-right-section">
          <div onClick={onClickEvent} className="disconnect">
            <Cross crossClassName="deposit-cross" />
            <div>Disconnect</div>
          </div>
          <div className="wallet-addresss">{truncateWalletAddress(userWallets.find(w => w.chain == walletChain)?.address || '')}</div>
        </div>}
        { showConnect 
            ? <DynamicConnectButton>
                <div className="flex items-center gap-1 modal-connect">
                  <div>
                    <ConnectIcon connectClassName="modal-connect"/>
                  </div>
                  <div className="modal-connect-wallet">Connect Wallet</div>
                </div>
              </DynamicConnectButton>
          : null
        }
      </div>
      { true && chainName.includes("Eclipse") && 
        <div className="
          flex flex-row items-center justify-between 
          p-[10px] w-[104%] h-[34px] mt-[14px] mb-[-8px] 
          rounded-[4px] bg-[#ffffff08] border-[0.69px] border-[#ffffff1a]
        ">
          <input className="
            bg-transparent 
            placeholder:text-[12px] placeholder:font-medium placeholder:text-[#ffffff4d]
          " 
            type="" 
            placeholder="Enter Wallet Address"
            value={eclipseAddr}
            ref={inputRef}
            onChange={handleInputChange}
          />
          <button 
            className="
              flex items-center w-[42px] h-[17px] 
              bg-[#a1fea01a] rounded-[10px] 
              py-[2px] px-[8px] 
              text-[10px] text-[#a1fea0] font-medium
            "
            onClick={handlePaste}>
              Paste
          </button>
        </div>
      }
    </div>
  );
}
