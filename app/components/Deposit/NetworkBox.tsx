"use client";
import React, { useCallback, useRef, useEffect, useContext } from 'react';
import './styles.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { WalletIcon } from "@/app/components/icons"
import { Cross, ConnectIcon } from "../icons";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import Skeleton from 'react-loading-skeleton';
import { truncateWalletAddress } from '@/lib/stringUtils';
import { useWallets } from "@/app/hooks/useWallets";
import { DEPOSIT_TX_GAS_LIMIT, WITHDRAW_TX_FEE } from '../constants';
import { EthereumDataContext } from '@/app/context';

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
  gasPriceWei: bigint | undefined
  maxPriorityFeePerGasWei: bigint | undefined
}

function roundUpToFiveDecimals(value: number): number {
  return Math.ceil(value * 10**5) / 10**5
}

// NB: rounds up to 5 decimals
function calculateMaxTxFeeEther(gasPriceWei: bigint, maxPriorityFeePerGasWei: bigint): number {
  const maxFeeWei: bigint = (gasPriceWei * BigInt(DEPOSIT_TX_GAS_LIMIT)) + (maxPriorityFeePerGasWei * BigInt(DEPOSIT_TX_GAS_LIMIT));
  // add 12.5% to base fee to assume last block was 100% full
  // we also add it to the priority fee just in case; the fee estimate from the wallet provider can differ significantly
  // e.g. at times viem suggested 1.5gwei vs 1.6 - 1.7 gwei from metamask; other times metamask was the same
  // we could use a static guess of 2gwei based on docs like https://www.blocknative.com/blog/eip-1559-fees
  const maxFeeEther: number = (Number(maxFeeWei) / 10**18) * 1.125

  const fiveDecimalRounded = roundUpToFiveDecimals(maxFeeEther)

  return fiveDecimalRounded
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
  setAmountEther,
  gasPriceWei,
  maxPriorityFeePerGasWei
}) => {
  const { userWallets, evmWallet, solWallet } = useWallets();
  const [gasPrice, ethPrice, blockNumber] = useContext(EthereumDataContext) ?? [null, null, null];
  const inputRef = useRef<HTMLInputElement>(null);

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

  function adjustInputWidth() {
    if (inputRef.current) {
      const refs = inputRef.current;
      const len = refs.value.length; 
      refs.style.width = ((len ? len : 5) + (refs.value.toString().includes(".") ? 0 : 0.5)) + 'ch';
    }
  }

  useEffect(() => {
    adjustInputWidth();
  })

  const maxTxFeeEther = walletChain === "SOL" ? WITHDRAW_TX_FEE : calculateMaxTxFeeEther(gasPriceWei ?? BigInt(0), maxPriorityFeePerGasWei ?? BigInt(0))
  // remove bottom border for ethereum box
  const css = direction === "From" ? "!border-b-0 !rounded-bl-none !rounded-br-none" : ""; 

  return (
    <div className="network-box flex flex-col" onClick={() => inputRef.current?.focus()}>
      <div className={`network-info flex items-center justify-center ${css}`}>
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
      { direction === "From" && 
        <div className="w-full">
          <div className={ `amount-input flex flex-col ${determineInputClass()}` }>
            <div className="amount-input-top flex justify-between w-full items-center">
            <div className="input-wrapper"> 
            { (!evmWallet || evmWallet && (balanceEther >= 0))
              ? <><input
                  disabled={!evmWallet || !solWallet}
                  step="0.01"
                  min="0"
                  placeholder="0 ETH"
                  style={{fontWeight: "500", minWidth: "1.5ch"}}
                  value={amountEther}
                  ref={inputRef}
                  onChange={(e) => { 
                    const value = e.target.value;
                    // don't allow string
                    if (/^[-+]?(\d+([.,]\d*)?|[.,]\d+)$/.test(value) || value === "" || value === ".") {
                      const [_, dp] = value.split(".");
                      if (!dp || dp.length <= 9) {
                        setAmountEther(value);
                        adjustInputWidth();
                      }
                    } 
                  }} 
              />{ amountEther && <span className="font-medium text-[34px] ml-[-4px]">ETH</span> }</>
              : <Skeleton height={40} width={160} />
            }
            </div> 
              <div className="token-display">
                <div className="token-icon">
                  <img src="eth.png" alt="ETH Icon" />
                </div>
                <div className="token-name">ETH</div>
              </div>
            </div>
            <div className={`${evmWallet && solWallet ? '' : 'invisible'} amount-input-bottom flex flex-row justify-between w-full items-center`}>
              {evmWallet && 
                <div className="balance-info w-full">
                  {(balanceEther >= 0 && ethPrice)
                    ? (amountEther && amountEther != ".") 
                      ? <span className="font-medium">${(parseFloat(amountEther.toString()) * ethPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} </span> 
                      : <span className="font-medium">$0.00</span>
                    : <span style={{width: "20%"}}><Skeleton inline={true} style={{ borderRadius: "20px"}}/></span>
                  }
                </div>
              }
              <div className={evmWallet && solWallet ? "percentage-buttons" : "invisible"}>
                <div className="flex flex-row items-center gap-2 mr-1">
                  <WalletIcon width="12" />
                  { balanceEther >= 0 
                    ? <span className="font-medium">{ balanceEther }</span>
                    : <Skeleton height={18} width={52} style={{ borderRadius: "20px"}} />
                  }
                </div>
                <span>•</span>
                <button
                  className="percentage-button disabled:text-neutral-800 disabled:hover:text-neutral-800 disabled:hover:cursor-not-allowed"
                  disabled={balanceEther * .5 <= maxTxFeeEther}
                  onClick={() => {
                    setAmountEther(balanceEther * 0.50)
                    setTimeout(adjustInputWidth, 0)
                  }}
                >
                    50%
                </button>
                <button 
                  className="percentage-button disabled:text-neutral-800 disabled:hover:text-neutral-800 disabled:hover:cursor-not-allowed"
                  disabled={balanceEther <= maxTxFeeEther}
                  onClick={() => {
                    setAmountEther(roundUpToFiveDecimals(balanceEther - maxTxFeeEther))
                    setTimeout(adjustInputWidth, 0)
                  }}
                >
                    Max
                </button>
              </div>
            </div>
          </div>
        </div> 
      }
    </div>
  );
}
