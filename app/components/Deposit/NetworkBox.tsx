"use client";
import React, { useCallback } from 'react';
import './styles.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Cross, ConnectIcon } from "../icons";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import Skeleton from 'react-loading-skeleton';
import { truncateWalletAddress } from '@/lib/stringUtils';
import { useWallets } from "@/app/hooks/useWallets";

export interface NetworkBoxProps {
  imageSrc: string;
  direction: string;
  chainName: string;
  onClickEvent: () => void;
  walletChain: "EVM" | "SOL";
  showConnect: boolean;
  wallet: any;
  balanceEther: number;
  amountEther: string | number | undefined;
  setAmountEther: React.Dispatch<React.SetStateAction<string | number | undefined>>;
}

export const NetworkBox: React.FC<NetworkBoxProps> = ({ 
  imageSrc, 
  direction, 
  chainName, 
  onClickEvent, 
  walletChain, 
  showConnect, 
  wallet,
  balanceEther,
  amountEther,
  setAmountEther
}) => {
  const { userWallets, evmWallet, solWallet } = useWallets();
  function determineInputClass(): string {
    if (!evmWallet || !solWallet) return 'disabled';
    if (parseFloat(amountEther as string) > balanceEther) {
      return 'alarm'
    }
    return ""
  }
  const setInputRef = useCallback((node: HTMLInputElement) => {
    if (node) {
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault()
      };
      node.addEventListener('wheel', handleWheel);
      return () => {
        node.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  return (
    <div className="network-box flex flex-col">
      <div className="network-info flex items-center justify-center">
        <div className='network-info-left-section flex items-center justify-center'>
          <img src={imageSrc} alt="" style={{ objectFit: "cover", height: "44px", width: "44px"}} />
          <div className="input-inner-container">
            <span className="direction" style={{ fontWeight: "500"}}>{direction}</span>
            <span className="name" style={{ fontWeight: "500"}}>{chainName}</span>
          </div>
        </div>
        {wallet && <div className="network-info-right-section">
          <div className="wallet-addresss">
            <div onClick={onClickEvent} className="disconnect gap-[8px]">
              <span className="addr">
                {truncateWalletAddress(userWallets.find(w => w.chain == walletChain)?.address || '')}
              </span>
              <Cross crossClassName="deposit-cross" />
            </div>
          </div>
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
      { chainName.includes("Ethereum") && 
        <div>
          <div className={ `amount-input flex flex-col ${determineInputClass()}` }>
            <div className="amount-input-top flex justify-between w-full items-center">
            <div className="input-wrapper"> 
            { (!evmWallet || evmWallet && (balanceEther >= 0))
              ? <input
                  disabled={!evmWallet || !solWallet}
                  step="0.01"
                  min="0"
                  placeholder="0 ETH"
                  style={{fontWeight: "500"}}
                  value={amountEther}
	                ref={setInputRef}
                  onChange={(e) => { 
                    const value = e.target.value;
                    // don't allow string
                    if (/^[-+]?(\d+([.,]\d*)?|[.,]\d+)$/.test(value) || value === '') {
                      const [_, dp] = value.split(".");
                      if (!dp || dp.length <= 9) {
                        setAmountEther(value);
                      }
                    } 
                  }} 
              />
              : <Skeleton height={40} width={160} />
            }
            </div> 
              <div className="token-display" style={{width: "45%"}}>
                <div className="token-icon">
                  <img src="eth.png" alt="ETH Icon" />
                </div>
                <div className="token-name">ETH</div>
              </div>
            </div>
            <div className={`${evmWallet ? '' : 'hidden'} amount-input-bottom flex flex-row justify-between w-full items-center`}>
              {evmWallet && 
                <div className="balance-info w-full">
                  <span>Bal</span> 
                  {(balanceEther >= 0)
                    ? <><span style={{ color: '#fff' }}>{balanceEther + " "} </span> <>ETH</></> 
                    : <span style={{width: "20%"}}><Skeleton inline={true}/></span>
                  }
                </div>
              }
              <div className={evmWallet ? "percentage-buttons" : "invisible"}>
                <button onClick={() => setAmountEther(balanceEther * 0.25)} className="percentage-button">25%</button>
                <button onClick={() => setAmountEther(balanceEther * 0.50)} className="percentage-button">50%</button>
                <button onClick={() => setAmountEther(balanceEther)} className="percentage-button">Max</button>
              </div>
            </div>
          </div>
        </div> 
      }
    </div>
  );
}
