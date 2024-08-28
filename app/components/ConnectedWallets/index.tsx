import { useUserWallets, Wallet } from '@dynamic-labs/sdk-react-core';
import React, { useEffect, useState } from 'react';
import { createPublicClient, formatEther, http } from 'viem';
import { getBalance } from 'viem/actions';
import { mainnet } from 'viem/chains';
import './styles.css';
import Cross from '../icons/cross';
import Copy from '../icons/copy'
import Disconnect from '../icons/disconnect';
import { truncateWalletAddress } from '@/lib/stringUtils';
import { getWalletBalance } from '@/lib/solanaUtils';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

interface ConnectedWalletsProps {
  close: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  ref: React.RefObject<HTMLDivElement>;
}

const ConnectedWallets = ({ close, ref }: ConnectedWalletsProps ) => {
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const [balanceEther, setAmountBalanceEther] = useState(0);
  const [balanceEclipse, setAmountBalanceEclipse] = useState(0);
  
  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;

      if (wallet.chain == "EVM") {
        const balance = await getBalance(client, {
          //@ts-ignore
          address: wallet.address,
          blockTag: 'safe'
        })

        const balanceAsEther = formatEther(balance);
        const formattedEtherBalance = balanceAsEther.includes('.') ? balanceAsEther.slice(0, balanceAsEther.indexOf('.') + 5) : balanceAsEther
        const balanceEther = parseFloat(formattedEtherBalance);
        setAmountBalanceEther(balanceEther);

      }
      if (wallet.chain == "SOL") {
        const balance = await getWalletBalance(wallet.address);
        setAmountBalanceEclipse(balance);
      }

    });
  }, [userWallets]);


  const eclipseWallet = {
    icon: 'eclipse.png',
    name: 'Eclipse Wallet',
    address: solWallet?.address,
    balance: balanceEclipse,
  };

  const ethereumWallet = {
    icon: 'eth.png',
    name: 'Ethereum Wallet',
    address: evmWallet?.address,
    balance: balanceEther,
  };

  return (
    <div  ref={ref} className="connected-wallets-modal">
      <div className="connected-wallets-header">
        <div>Connected Wallets</div>
        <div onClick={(e) => close(e)}> <Cross crossClassName='wallets-cross' /> </div>
      </div>
      <ul className="wallet-list">
        <li className="wallet-item">
          <div className="wallet-title"> Eclipse Wallet </div>
          <div className="wallet-details">
            <div className="wallet-details-top flex justify-between items-center">
            <div className="flex flex-row">

                <img
                  src={eclipseWallet.icon}
                  alt="Eclipse Icon"
                  className="wallet-icon"
                />
                <div> {truncateWalletAddress(solWallet?.address || '')}</div>
            </div>
            <div className="flex" style={{gap: "8px"}}>
                <div onClick={() => navigator.clipboard.writeText(solWallet?.address || '')}>
                  <Copy copyClassName="modal-copy" />
                </div>
                <Disconnect disconnectClassName="modal-disconnect" />
            </div>
            </div>
            <div className="wallet-details-bottom">

              <div className="wallet-details-balance">
                Balance
              </div>
              <div>
                {balanceEclipse} ETH
              </div>
              </div>
          </div>
        </li>
        <li className="wallet-item">
          <div className="wallet-title"> Ethereum Wallet </div>
          <div className="wallet-details">
            <div className="wallet-details-top">
              <img
                src={ethereumWallet.icon}
                alt="Ethereum Icon"
                className="wallet-icon"
              />
              <div> {truncateWalletAddress(evmWallet?.address || '')}</div>

            </div>
            <div className="wallet-details-bottom">
              <div className="wallet-details-balance">
                Balance
              </div>
              <div>
                {balanceEther} ETH
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ConnectedWallets;
