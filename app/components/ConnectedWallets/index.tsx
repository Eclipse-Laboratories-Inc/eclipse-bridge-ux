import { useUserWallets, Wallet } from '@dynamic-labs/sdk-react-core';
import React, { useEffect, useState, forwardRef } from 'react';
import { createPublicClient, formatEther, http } from 'viem';
import { useDynamicContext, DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { getBalance } from 'viem/actions';
import { mainnet } from 'viem/chains';
import './styles.css';
import Cross from '../icons/cross';
import Copy from '../icons/copy'
import ConnectIcon from '../icons/connect'
import CircleCheck from '../icons/circle-check'
import Disconnect from '../icons/disconnect';
import { truncateWalletAddress } from '@/lib/stringUtils';
import { getWalletBalance } from '@/lib/solanaUtils';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

interface ConnectedWalletsProps {
  close: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
//ref: React.RefObject<HTMLDivElement>;
}

// const ConnectedWallets = ({ close, ref }: ConnectedWalletsProps ) => {
const ConnectedWallets = forwardRef<HTMLDivElement, ConnectedWalletsProps>(({ close }, ref) => {
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const [copiedEclipse, setCopiedEclipse] = useState(false);
  const [copiedEth, setCopiedEth] = useState(false);
  const [balanceEther, setAmountBalanceEther] = useState(0);
  const [balanceEclipse, setAmountBalanceEclipse] = useState(0);
  const { handleUnlinkWallet } = useDynamicContext();
  
  const handleCopy = (address: string = "", stateSetter: (state: boolean) => void) => {
    stateSetter(true);
    navigator.clipboard.writeText(address);
    setTimeout(() => stateSetter(false), 1000);
  }
  
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
    <div ref={ref} className="connected-wallets-modal">
      <div className="connected-wallets-header">
        <div>Connected Wallets</div>
        <div onClick={(e) => close(e)}> <Cross crossClassName='wallets-cross' /> </div>
      </div>
      <ul className="wallet-list">
        <li className="wallet-item">
          <div className="wallet-title"> Eclipse Wallet </div>
          <div className={solWallet ? "wallet-details" : "wallet-details disconnected"}>
            <div className="wallet-details-top flex justify-between items-center">
            <div className="flex flex-row">
         t       <img
                  src={eclipseWallet.icon}
                  alt="Eclipse Icon"
                  className="wallet-icon"
                />
                <div> {truncateWalletAddress(solWallet?.address || '-')}</div>
            </div>
          { (solWallet)
            ? <div className="flex items-center" style={{gap: "8px"}}>
                <div className={copiedEclipse ? "hidden" : ""} onClick={() => handleCopy(solWallet?.address, setCopiedEclipse)}>
                  <Copy copyClassName="modal-copy" />
                </div>
                <div className={copiedEclipse ? "visible" : "hidden"}>
                  <CircleCheck circleClassName="modal-circle" />
                </div>
                <div onClick={() => solWallet && handleUnlinkWallet(solWallet.id)}>
                  <Disconnect disconnectClassName="modal-disconnect" />
                </div>
              </div>
           : <DynamicConnectButton buttonClassName="" buttonContainerClassName="">
                <div className="flex items-center gap-1 modal-connect">
                  <div>
                    <ConnectIcon connectClassName="modal-connect"/>
                  </div>
                  <div className="modal-connect-wallet">Connect Wallet</div>
                </div>
            </DynamicConnectButton>
          }
            </div>
            <div className={ solWallet ? "wallet-details-bottom" : "hidden"}>
              <div className="wallet-details-balance">
                Balance
              </div>
              <div className="balance-eth">
                {balanceEclipse} ETH
              </div>
            </div>
          </div>
        </li>
        <li className="wallet-item">
          <div className="wallet-title"> Ethereum Wallet </div>
          <div className={ evmWallet ? "wallet-details" : "wallet-details disconnected"}>
            <div className="wallet-details-top flex justify-between items-center">
            <div className="flex flex-row">
              <img
                src={ethereumWallet.icon}
                alt="Ethereum Icon"
                className="wallet-icon"
              />
              <div> {truncateWalletAddress(evmWallet?.address || '-')}</div>
            </div>


          { (evmWallet)
            ? <div className={evmWallet ? "flex items-center" : "hidden"} style={{gap: "8px"}}>
                <div className={copiedEth ? "hidden" : ""} onClick={() => handleCopy(evmWallet?.address, setCopiedEth)}>
                  <Copy copyClassName="modal-copy" />
                </div>
                <div className={copiedEth ? "visible" : "hidden"}>
                  <CircleCheck circleClassName="modal-circle" />
                </div>
                <div onClick={() => evmWallet && handleUnlinkWallet(evmWallet.id) }>
                  <Disconnect disconnectClassName="modal-disconnect" />
                </div>
            </div>


           : <DynamicConnectButton buttonClassName="" buttonContainerClassName="">
                <div className="flex items-center gap-1 modal-connect">
                  <div>
                    <ConnectIcon connectClassName="modal-connect" />
                  </div>
                  <div className="modal-connect-wallet">Connect Wallet</div>
                </div>
            </DynamicConnectButton>
          }

            </div>
            <div className={ evmWallet ? "wallet-details-bottom" : "hidden" }>
              <div className="wallet-details-balance">
                Balance
              </div>
              <div className="balance-eth">
                {balanceEther} ETH
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
});

ConnectedWallets.displayName = "ConnectedWallets";
export default ConnectedWallets;
