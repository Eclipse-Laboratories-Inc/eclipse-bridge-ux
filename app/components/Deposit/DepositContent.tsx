"use client";
import React, { useEffect, useState } from 'react';

import './styles.css';
import 'react-loading-skeleton/dist/skeleton.css';

import TransferArrow from '../icons/transferArrow';

import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";

import { mainnet, sepolia } from "viem/chains";
import { createPublicClient, formatEther, http, parseEther, WalletClient } from 'viem';
import { Transport, Chain, Account } from 'viem';
import { getBalance } from 'viem/actions';
import { Options, useNetwork } from "@/app/contexts/NetworkContext"; 
import ExtendedDetails from '../ExtendedDetails'

import { solanaToBytes32 } from '@/lib/solanaUtils';
import { generateTxObjectForDetails } from "@/lib/activityUtils";

import { TransactionDetails } from "../TransactionDetails";
import { useTransaction } from "../TransactionPool";
import { NetworkBox } from "./NetworkBox"
import { CONTRACT_ABI, MIN_DEPOSIT_AMOUNT } from "../constants";
import { useWallets } from "@/app/hooks/useWallets";
import useEthereumData from "@/lib/ethUtils";

export interface DepositContentProps {
  modalStuff: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<React.SetStateAction<number | undefined | string>>;
}

export const DepositContent: React.FC<DepositContentProps> = ({ modalStuff, amountEther, setAmountEther }) => {
  const [walletClient, setWalletClient] = useState<WalletClient<Transport, Chain, Account> | null>(null);
  const { gasPrice, ethPrice } = useEthereumData();
  const [balanceEther, setAmountBalanceEther] = useState<number>(-1);
  const [isEvmDisconnected, setIsEvmDisconnected] = useState(false);
  const [isSolDisconnected, setIsSolDisconnected] = useState(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [ethTxStatus, setEthTxStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = modalStuff; 
  const { selectedOption, contractAddress } = useNetwork();
  const [client, setClient] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);

  const { handleUnlinkWallet, rpcProviders } = useDynamicContext();
  const { addNewDeposit } = useTransaction();

  const { userWallets, evmWallet, solWallet } = useWallets();
  const isMainnet = (selectedOption === Options.Mainnet);

  useEffect(() => {
    const cid = isMainnet ? 1 : 11155111;
    const lprovider = rpcProviders.getEvmRpcProviderByChainId(cid);
    setProvider(lprovider);
    console.log("new providoo", cid)
  }, [evmWallet?.chain, isMainnet])
  
  useEffect(() => {
    const isMainnet = (selectedOption === Options.Mainnet);
    const mclient = createPublicClient({
      chain: isMainnet ? mainnet : sepolia,
      transport: isMainnet ? http("https://eth.llamarpc.com") : http("https://sepolia.drpc.org"),
      cacheTime: 0
    })
    setClient(mclient);
  }, [selectedOption])

  useEffect(() => {
    let lWalletClient = evmWallet?.connector.getWalletClient<WalletClient<Transport, Chain, Account>>();
    lWalletClient && (lWalletClient.cacheTime = 0);
    setWalletClient(lWalletClient ?? null);
  }, [evmWallet?.connector])


  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;
      // ignore this for sepolia
      if (( !provider && process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet") || !(wallet.chain == "EVM")) return;
      const balance = await getBalance(client, {
        //@ts-ignore
        address: wallet.address
      })

      const balanceAsEther = formatEther(balance);
      const formattedEtherBalance = balanceAsEther.includes('.') ? balanceAsEther.slice(0, balanceAsEther.indexOf('.') + 5) : balanceAsEther
      const balanceEther = parseFloat(formattedEtherBalance);
      setAmountBalanceEther(balanceEther);
    });
  }, [userWallets, client]);

  const submitDeposit = async () => {
    setIsModalOpen(true);
    setEthTxStatus("Continue in your wallet");
    const destinationBytes32 = solanaToBytes32(solWallet?.address || '');
    const [account] = await walletClient!.getAddresses()
    const weiValue = parseEther(amountEther?.toString() || '');

    try {
      console.log("zzzzoo", contractAddress);
      console.log("prio", provider)
      const { request } = await client.simulateContract({
        //@ts-ignore
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'deposit',
        args: [destinationBytes32, weiValue],
        account,
        value: weiValue,
        chain: isMainnet ? mainnet : sepolia
      })
      let txResponse = await walletClient!.writeContract(request);
      // rabby returns the tx hash without 0x
      if (!txResponse.startsWith("0x"))
        txResponse = `0x${txResponse}`

      setEthTxStatus("Confirming");
      await client.waitForTransactionReceipt({ hash: txResponse, retryCount: 150, retryDelay: 2_000, confirmations: 1 }); 
      const txData = await generateTxObjectForDetails(provider ? provider.provider : client, txResponse);

      setAmountEther("");
      addNewDeposit(txData);
      setCurrentTx(txData);

    } catch (error) {
      setIsModalOpen(false);
      console.error('Failed to deposit', error);
    }
  };

  function determineButtonClass(): string {
    if (!evmWallet || !solWallet) {
      return 'submit-button disabled'
    }
    if (!amountEther) {
      return 'submit-button disabled'
    }  
    if (parseFloat(amountEther as string) < MIN_DEPOSIT_AMOUNT) {
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
    if (parseFloat(amountEther as string) < MIN_DEPOSIT_AMOUNT) {
      return `Min amount ${MIN_DEPOSIT_AMOUNT} ETH`
    }

    if (parseFloat(amountEther as string) > balanceEther) {
      return 'Insufficient Funds'
    }
    
    return 'Deposit'
  }

  return (
    <>
    <div className={isModalOpen ? "status-overlay active" : "status-overlay"}></div>
    { !isModalOpen && <div>
        <div className="network-section">
          <div className="arrow-container">
            <TransferArrow />
          </div>

          <NetworkBox 
            imageSrc="eth.png"
            direction="From"
            chainName={ isMainnet ? "Ethereum Mainnet" : "Ethereum Sepolia" }
            onClickEvent={() => evmWallet && handleUnlinkWallet(evmWallet.id) && setIsEvmDisconnected(!isEvmDisconnected)}
            walletChain="EVM"
            showConnect={(!evmWallet && isEvmDisconnected && !isSolDisconnected)}
            wallet={evmWallet}
            balanceEther={balanceEther}
            amountEther={amountEther}
            setAmountEther={setAmountEther}
          />
          <NetworkBox 
            imageSrc="eclipse.png"
            direction="To"
            chainName={ isMainnet ? "Eclipse Mainnet" : "Eclipse Testnet" }
            onClickEvent={() => solWallet && handleUnlinkWallet(solWallet.id) && setIsSolDisconnected(!isSolDisconnected)}
            walletChain="SOL"
            showConnect={(!solWallet && isSolDisconnected && !isEvmDisconnected)}
            wallet={solWallet}
            balanceEther={balanceEther}
            amountEther={amountEther}
            setAmountEther={setAmountEther}
          />
        </div>
        <ExtendedDetails 
           amountEther={amountEther}
           target="Eclipse"
           feeInEth={gasPrice && 113200 * (gasPrice) / 10**9}
        />
        { (!evmWallet || !solWallet) 
        ?
            <DynamicConnectButton buttonClassName="wallet-connect-button w-full" buttonContainerClassName="submit-button connect-btn">
              <span style={{ width: '100%' }}> {determineButtonText()}</span>
            </DynamicConnectButton>
        : 
            <button className={`w-full deposit-button p-4 ${determineButtonClass()}`} onClick={submitDeposit}>
              {determineButtonText()}
            </button>
        }
        </div>
    }
        
    { isModalOpen && <TransactionDetails ethStatus={ethTxStatus} from={"deposit"} tx={currentTx} closeModal={() => {
        setTimeout(() => { setIsModalOpen(false), setCurrentTx(null) }, 100);
    }} /> }
    </>
  );
};

