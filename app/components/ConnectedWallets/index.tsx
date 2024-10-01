import React, { useEffect, useState, forwardRef, useMemo, useCallback } from 'react';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';
import { mainnet, sepolia } from "viem/chains";
import { createPublicClient, formatEther, http } from 'viem';
import { getBalance } from 'viem/actions';
import './styles.css';
import { Cross, Copy, ConnectIcon, CircleCheck, Disconnect } from "../icons";
import { truncateWalletAddress } from '@/lib/stringUtils';
import { getWalletBalance } from '@/lib/solanaUtils';
import { useWallets } from '@/app/hooks/useWallets';

const client = createPublicClient({
  chain: process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet" ? mainnet : sepolia,
  transport: http(),
});

interface ConnectedWalletsProps {
  close: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

interface WalletData {
  icon: string;
  name: string;
  address?: string;
  balance: number;
}

const useWalletData = () => {
  const { userWallets, evmWallet, solWallet } = useWallets();
  const [balanceEther, setBalanceEther] = useState(0);
  const [balanceEclipse, setBalanceEclipse] = useState(0);

  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;

      if (wallet.chain === "EVM") {
        const balance = await getBalance(client, {
          address: wallet.address as `0x${string}`,
          blockTag: 'safe'
        });

        const balanceAsEther = formatEther(balance);
        const formattedEtherBalance = parseFloat(balanceAsEther.slice(0, balanceAsEther.indexOf('.') + 5));
        setBalanceEther(formattedEtherBalance);
      }
      if (wallet.chain === "SOL") {
        const balance = await getWalletBalance(wallet.address);
        setBalanceEclipse(balance);
      }
    });
  }, [userWallets]);

  return {
    solWallet,
    evmWallet,
    balanceEther,
    balanceEclipse
  };
};

const ConnectedWallets = forwardRef<HTMLDivElement, ConnectedWalletsProps>(({ close }, ref) => {
  const { handleUnlinkWallet } = useDynamicContext();
  const { solWallet, evmWallet, balanceEther, balanceEclipse } = useWalletData();
  const [copiedEclipse, setCopiedEclipse] = useState(false);
  const [copiedEth, setCopiedEth] = useState(false);

  const handleCopy = useCallback((address: string = "", stateSetter: (state: boolean) => void) => {
    stateSetter(true);
    navigator.clipboard.writeText(address);
    setTimeout(() => stateSetter(false), 1000);
  }, []);

  const walletData: WalletData[] = useMemo(() => [
    {
      icon: 'eclipse.png',
      name: 'Eclipse Wallet',
      address: solWallet?.address,
      balance: balanceEclipse,
    },
    {
      icon: 'eth.png',
      name: 'Ethereum Wallet',
      address: evmWallet?.address,
      balance: balanceEther,
    }
  ], [solWallet, evmWallet, balanceEclipse, balanceEther]);

  const renderWalletItem = useCallback((wallet: WalletData, index: number) => {
    const isConnected = !!wallet.address;
    const isEclipse = index === 0;
    const isCopied = isEclipse ? copiedEclipse : copiedEth;
    const setCopied = isEclipse ? setCopiedEclipse : setCopiedEth;
    const currentWallet = isEclipse ? solWallet : evmWallet;

    return (
      <li key={wallet.name} className="wallet-item">
        <div className="wallet-title">{wallet.name}</div>
        <div className={`wallet-details ${isConnected ? '' : 'disconnected'}`}>
          <div className="wallet-details-top flex justify-between items-center">
            <div className="flex flex-row">
              <img src={wallet.icon} alt={`${wallet.name} Icon`} className="wallet-icon" />
              <div>{truncateWalletAddress(wallet.address || '-')}</div>
            </div>
            {isConnected ? (
              <div className="flex items-center" style={{gap: "8px"}}>
                <div className={isCopied ? "hidden" : ""} onClick={() => handleCopy(wallet.address, setCopied)}>
                  <Copy copyClassName="modal-copy" />
                </div>
                <div className={isCopied ? "visible" : "hidden"}>
                  <CircleCheck circleClassName="modal-circle" />
                </div>
                <div onClick={() => currentWallet && handleUnlinkWallet(currentWallet.id) && close()}>
                  <Disconnect disconnectClassName="modal-disconnect" />
                </div>
              </div>
            ) : (
              <DynamicConnectButton buttonClassName="" buttonContainerClassName="">
                <div className="flex items-center gap-1 modal-connect">
                  <ConnectIcon connectClassName="modal-connect"/>
                  <div className="modal-connect-wallet">Connect Wallet</div>
                </div>
              </DynamicConnectButton>
            )}
          </div>
          {isConnected && (
            <div className="wallet-details-bottom">
              <div className="wallet-details-balance">Balance</div>
              <div className="balance-eth">{wallet.balance} ETH</div>
            </div>
          )}
        </div>
      </li>
    );
  }, [copiedEclipse, copiedEth, handleCopy, handleUnlinkWallet, solWallet, evmWallet]);

  return (
    <div ref={ref} className="connected-wallets-modal">
      <div className="connected-wallets-header flex items-center">
        <div>Connected Wallets</div>
        <div className="cross-wrapper" onClick={close}>
          <Cross crossClassName='wallets-cross' />
        </div>
      </div>
      <ul className="wallet-list">
        {walletData.map(renderWalletItem)}
      </ul>
    </div>
  );
});

ConnectedWallets.displayName = "ConnectedWallets";
export default ConnectedWallets;
