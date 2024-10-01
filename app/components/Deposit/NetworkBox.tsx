"use client";
import React from 'react';
import './styles.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Cross, ConnectIcon } from "../icons";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
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
}

export const NetworkBox: React.FC<NetworkBoxProps> = ({ imageSrc, direction, chainName, onClickEvent, walletChain, showConnect, wallet }) => {
  const { userWallets } = useWallets();

  return (
    <div className="network-box">
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
    </div>
  );
}
