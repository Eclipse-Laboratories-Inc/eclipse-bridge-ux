"use client";
import React, { useEffect, useState } from 'react';
import {  utils } from 'ethers';
import { PublicKey, PublicKeyInitData } from '@solana/web3.js';
import './styles.css';
import TransferArrow from './transferArrow';
import {
  DynamicConnectButton,
  useUserWallets,
  useDynamicContext,
  Wallet,
} from "@dynamic-labs/sdk-react-core";
import Cross from '../cross';
import { createPublicClient, createWalletClient, custom, formatEther, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { getBalance } from 'viem/actions';
import { truncateWalletAddress } from '@/lib/stringUtils';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})


  const solanaToBytes32 = (solanaAddress: PublicKeyInitData) => {
    try {
      const publicKey = new PublicKey(solanaAddress);
      return utils.hexlify(publicKey.toBytes().slice(0, 32));
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
  const [amountEther, setAmountEther] = useState(undefined as number | string | undefined );
  const [balanceEther, setAmountBalanceEther] = useState(0);
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const { handleUnlinkWallet, rpcProviders } = useDynamicContext();
  const provider = rpcProviders.evmDefaultProvider



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
                <img src="eth.png" alt="Ethereum" />
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
                <img src="eclipse.png" alt="Eclipse" />
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
              type="number"
              step="0.01"
              placeholder="0 ETH"
              value={amountEther}
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
            <div className="percentage-buttons">
              <button onClick={() => setAmountEther(balanceEther * 0.25)} className="percentage-button">25%</button>
              <button onClick={() => setAmountEther(balanceEther * 0.50)} className="percentage-button">50%</button>
              <button onClick={() => setAmountEther(balanceEther)} className="percentage-button">Max</button>
            </div>
          </div>
        </div>
        { (!evmWallet || !solWallet) 
        ?
          <DynamicConnectButton buttonContainerClassName="submit-button">
            <span style={{ width: '100%' }}>Connect Wallets</span>
          </DynamicConnectButton>
        : <button className="submit-button" onClick={submitDeposit}>
            Deposit
          </button>
        }
          <div className="estimated-time">
            <span>Estimated time ~ 5 mins</span>
          </div>
        </div>
      </div>
      );
};

      export default Deposit;