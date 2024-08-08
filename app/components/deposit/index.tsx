"use client";
import React, { useEffect, useState } from 'react';
import { ethers, utils } from 'ethers';
import { PublicKey, PublicKeyInitData } from '@solana/web3.js';
import './styles.css';
import TransferArrow from './transferArrow';
import {
  DynamicConnectButton,
  useUserWallets,
  useDynamicContext,
  Wallet,
} from "@dynamic-labs/sdk-react-core";
import Cross from './cross';
import { createPublicClient, formatEther, http } from 'viem'
import { mainnet } from 'viem/chains'
import { getBalance, setBalance } from 'viem/actions';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

function truncateWalletAddress(str: string) {
  if (str.length <= 8) {
    return str;
  }

  const firstPart = str.slice(0, 4);
  const lastPart = str.slice(-4);

  return `${firstPart}...${lastPart}`;
}


const DepositInput = () => {
  const [amount, setAmount] = useState('');

  return (
    <div className="amount-input-container">
      <div className="amount-input-header">
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="amount-input-field"
        />
        <div className="currency-info">
          <img src="eth.png" alt="ETH" />
          <span>ETH</span>
        </div>
      </div>
      <div className="amount-input-footer">
        <span className="balance-label">Bal <span className="balance-value">2.467 ETH</span></span>
        <div className="percentage-buttons">
          <button className="percentage-button">25%</button>
          <button className="percentage-button">50%</button>
          <button className="percentage-button">Max</button>
        </div>
      </div>
    </div>
  );
};


const Deposit = () => {
  const [destinationSolana, setDestinationSolana] = useState('');
  const [amountEther, setAmountEther] = useState(0);
  const [balanceEther, setAmountBalanceEther] = useState(0);
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");
  const { handleUnlinkWallet, rpcProviders } = useDynamicContext();


  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;

      const provider = rpcProviders.evmDefaultProvider

      if (!provider) return;

      const balance = await getBalance(client, {
        //@ts-ignore
        address: wallet.address,
        blockTag: 'safe'
      })

      const balanceAsEther = formatEther(balance);
      const formattedEtherBalance = balanceAsEther.includes('.') ? balanceAsEther.slice(0, balanceAsEther.indexOf('.') + 5) : balanceAsEther
      const balanceEther = parseFloat(formattedEtherBalance);
      setAmountBalanceEther(balanceEther);

      console.log('balance', balanceAsEther);
    });
  }, [userWallets]);

  console.log({ userWallets })

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

  const solanaToBytes32 = (solanaAddress: PublicKeyInitData) => {
    try {
      const publicKey = new PublicKey(solanaAddress);
      return utils.hexlify(publicKey.toBytes().slice(0, 32));
    } catch (error) {
      console.error('Invalid Solana address', error);
      throw new Error('Invalid Solana address');
    }
  };

  // const deposit = async () => {
  //   if (typeof window.ethereum === 'undefined') {
  //     alert('Please install MetaMask!');
  //     return;
  //   }

  //   try {
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     await provider.send("eth_requestAccounts", []);
  //     const signer = await provider.getSigner();
  //     const contract = new ethers.Contract(contractAddress, abi, signer);

  //     const destinationBytes32 = solanaToBytes32(destinationSolana);
  //     const amountWei = ethers.parseEther(amountEther);

  //     const tx = await contract.deposit(destinationBytes32, amountWei, { value: amountWei });
  //     console.log(`Transaction hash: ${tx.hash}`);
  //     alert(`Transaction sent! Hash: ${tx.hash}`);
  //   } catch (error) {
  //     console.error(`Error during deposit: ${error.message}`);
  //     alert(`Error: ${error.message}`);
  //   }
  // };

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
                  <Cross />
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
                  <Cross />
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
          <DynamicConnectButton buttonContainerClassName="submit-button">
            { !evmWallet && !solWallet ? <span style={{ width: '100%' }}>Connect Wallets</span> : <span style={{ width: '100%' }}>Deposit</span>}
          </DynamicConnectButton>
          <div className="estimated-time">
            <span>Estimated time ~ 5 mins</span>
          </div>
        </div>
      </div>
      );
};

      export default Deposit;
