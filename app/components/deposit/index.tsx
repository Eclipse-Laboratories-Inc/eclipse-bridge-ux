"use client";
import React, { useEffect, useState, useCallback } from 'react';
import ExtendedDetails from "../ExtendedDetails";
import { PublicKey, PublicKeyInitData } from '@solana/web3.js';
import './styles.css';
import TransferArrow from '../icons/transferArrow';
import {
  DynamicConnectButton,
  useUserWallets,
  useDynamicContext,
  Wallet,
} from "@dynamic-labs/sdk-react-core";

import Cross from '../icons/cross';
import { createPublicClient, createWalletClient, custom, formatEther, http, parseEther, toHex } from 'viem'
import { mainnet } from 'viem/chains'
import { getBalance } from 'viem/actions';
import { truncateWalletAddress } from '@/lib/stringUtils';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})


  // TODO: move this to the lib
  const solanaToBytes32 = (solanaAddress: PublicKeyInitData) => {
    try {
      const publicKey = new PublicKey(solanaAddress);
      return toHex(publicKey.toBytes().slice(0, 32));
    } catch (error) {
      console.error('Invalid Solana address', error);
      throw new Error('Invalid Solana address');
    }
  };
  
  let walletClient: any;
  if (typeof window !== 'undefined' && window.ethereum) {
    walletClient = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum!),
    })
  }

interface DepositProps {
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<React.SetStateAction<number | undefined | string>>;
}

const Deposit: React.FC<DepositProps> = ({ amountEther, setAmountEther }) => {
  const [balanceEther, setAmountBalanceEther] = useState<number>(-1);
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");

  const { handleUnlinkWallet, rpcProviders } = useDynamicContext();
  
  const provider = rpcProviders.evmDefaultProvider;
  const setInputRef = useCallback((node: HTMLInputElement) => {
    if (node) {
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
      };

      node.addEventListener('wheel', handleWheel);

      return () => {
        node.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;


      if (!provider || !(wallet.chain == "EVM")) return;
      const balance = await getBalance(client, {
        //@ts-ignore
        address: wallet.address,
        blockTag: 'safe'
      })

      const balanceAsEther = formatEther(balance);
      const formattedEtherBalance = balanceAsEther.includes('.') ? balanceAsEther.slice(0, balanceAsEther.indexOf('.') + 5) : balanceAsEther
      const balanceEther = parseFloat(formattedEtherBalance);
      setAmountBalanceEther(balanceEther);
    });
  }, [userWallets]);

  const contractAddress = '0x83cB71D80078bf670b3EfeC6AD9E5E6407cD0fd1';
  const abi = [
    {
      inputs: [
        { internalType: 'bytes32', name: '', type: 'bytes32' },
        { internalType: 'uint256', name: '', type: 'uint256' },
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
  ];



  const submitDeposit = async () => {
    const destinationBytes32 = solanaToBytes32(solWallet?.address || '');
    const [account] = await walletClient.getAddresses()
    const weiValue = parseEther(amountEther?.toString() || '');

    try {
      const { request } = await client.simulateContract({
        address: contractAddress,
        abi,
        functionName: 'deposit',
        args: [destinationBytes32, weiValue],
        account,
        value: weiValue
      })
      await walletClient.writeContract(request)
    } catch (error) {
      console.error('Failed to deposit', error);
    }

  };

  function determineInputClass(): string {
    if (!evmWallet || !solWallet) return 'disabled';
    if (parseFloat(amountEther as string) > balanceEther) {
      return 'alarm'
    }
    return ""
  }

  function determineButtonClass(): string {
    if (!amountEther) {
      return 'submit-button disabled'
    }  
    if (parseFloat(amountEther as string) < 0.002) {
      return 'submit-button disabled'
    }

    if (parseFloat(amountEther as string) > balanceEther) {
      return 'submit-button alarm'
    }
    
    return 'submit-button' 
  }

  function determineButtonText(): string {
    if (!evmWallet && solWallet) {
      return "Connect Ethereum Wallet"
    }
    if (evmWallet && !solWallet) {
      return "Connect Eclipse Wallet"
    }
    if (!evmWallet && !solWallet) {
      return "Connect Wallets"
    }
    if (!amountEther) {
      return 'Deposit'
    }  
    if (parseFloat(amountEther as string) < 0.002) {
      return 'Min amount 0.002 ETH'
    }

    if (parseFloat(amountEther as string) > balanceEther) {
      return 'Insufficient Funds'
    }
    
    return 'Deposit'
  }

  return (
    <div className="deposit-container">
      <div className="deposit-card">
        <div className="header-tabs">
          <span className="active">Deposit</span>
          <span className="inactive">Withdraw</span>
        </div>
        <div className="network-section">
          <div className="arrow-container">
            <TransferArrow />
          </div>
          <div className="network-box">
            <div className="network-info">
              <div className='network-info-left-section'>
                <img src="eth.png" alt="Ethereum" style={{ objectFit: "cover", height: "44px", width: "44px"}} />
                <div className="input-inner-container">
                  <span className="direction">From</span>
                  <span className="name">Ethereum Mainnet</span>
                </div>
              </div>
              {evmWallet && <div className="network-info-right-section">
                <div onClick={() => evmWallet && handleUnlinkWallet(evmWallet.id)} className="disconnect">
                  <Cross crossClassName="deposit-cross" />
                  <div>Disconnect</div>
                </div>
                <div className="wallet-addresss">{truncateWalletAddress(userWallets.find(w => w.chain == "EVM")?.address || '')}</div>
              </div>
              }
            </div>
          </div>

          <div className="network-box">
            <div className="network-info">
              <div className='network-info-left-section'>
                <img src="eclipse.png" alt="Eclipse" style={{ objectFit: "cover", height: "44px", width: "44px"}} />
                <div className="input-inner-container">
                  <span className="direction">To</span>
                  <span className="name">Eclipse Mainnet</span>
                </div>
              </div>
              {solWallet && <div className="network-info-right-section">
                <div onClick={() => solWallet && handleUnlinkWallet(solWallet.id)} className="disconnect">
                  <Cross crossClassName="deposit-cross" />
                  <div>Disconnect</div>
                </div>
                <div className="wallet-addresss">{truncateWalletAddress(solWallet?.address || '')}</div>
              </div>}
            </div>
          </div>
        </div>
        <div className={ `amount-input flex flex-col ${determineInputClass()}` }>
          <div className="amount-input-top flex justify-between w-full items-center">
          <div className="input-wrapper"> 
          { (!evmWallet || evmWallet && (balanceEther >= 0))
            ? <input
              disabled={!evmWallet || !solWallet}
              type="number"
              step="0.01"
              min="0"
              placeholder="0 ETH"
              style={{fontWeight: "500"}}
              value={amountEther}
	            ref={setInputRef}
              onChange={(e) => setAmountEther(e.target.value)}
            />
            : <SkeletonTheme baseColor="#313131" highlightColor="#525252">
              <Skeleton height={40} width={160} />
            </SkeletonTheme>
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
                ?  <><span style={{ color: '#fff' }}>{balanceEther + " "} </span> <>ETH</></> 
                : <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                    <span style={{width: "20%"}}><Skeleton inline={true}/></span>
                  </SkeletonTheme>
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
        { (!evmWallet || !solWallet) 
        ?
            <DynamicConnectButton buttonClassName="wallet-connect-button w-full" buttonContainerClassName="submit-button connect-btn">
              <span style={{ width: '100%' }}>{determineButtonText()}</span>
            </DynamicConnectButton>
        : 
          <div className={determineButtonClass()}> 
            <button className="w-full deposit-button p-4" onClick={submitDeposit}>
              {determineButtonText()}
            </button>
          </div>
        }
        </div>
      </div>

      );
};

export default Deposit;
