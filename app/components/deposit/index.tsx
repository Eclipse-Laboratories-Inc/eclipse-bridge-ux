"use client";
import React, { useEffect, useState, useRef } from 'react';
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
  if (typeof window !== 'undefined') {
    walletClient = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum!),
    })
  }

const Deposit = () => {
  const [amountEther, setAmountEther] = useState<number | string | undefined>(undefined);
  const [balanceEther, setAmountBalanceEther] = useState(0);
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const { handleUnlinkWallet, rpcProviders } = useDynamicContext();
  
  const provider = rpcProviders.evmDefaultProvider;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
	    event.preventDefault();
    } 
    const input = inputRef.current;
    if (input) input.addEventListener('wheel', handleWheel);

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
        <div className="amount-input">
          <div className="amount-input-left">
            <input
              disabled={!evmWallet || !solWallet}
              type="number"
              step="0.01"
              placeholder="0 ETH"
              value={amountEther}
	      ref={inputRef}
              onChange={(e) => setAmountEther(e.target.value)}
            />
            {evmWallet &&
              <div className="balance-info">
                Bal  &nbsp;  <span style={{ color: '#fff' }}>{balanceEther + " "} </span> &nbsp; ETH
              </div>}
          </div>
          <div className="amount-input-right">
            <div className="token-display">
              <div className="token-icon">
                <img src="eth.png" alt="ETH Icon" />
              </div>
              <div className="token-name">ETH</div>
            </div>
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
          <div className="estimated-time">
            <span>Estimated time ~ 5 mins</span>
          </div>
        </div>
      </div>
      );
};

      export default Deposit;
