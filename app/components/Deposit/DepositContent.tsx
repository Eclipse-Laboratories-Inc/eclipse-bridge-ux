"use client";
import React, { useContext, useEffect, useState } from 'react';

import './styles.css';
import 'react-loading-skeleton/dist/skeleton.css';

import TransferArrow from '../icons/transferArrow';

import {
  DynamicConnectButton,
  useDynamicContext,
  useWalletConnectorEvent
} from "@dynamic-labs/sdk-react-core";

import { mainnet, sepolia } from "viem/chains";
import { createPublicClient, formatEther, http, parseEther, WalletClient } from 'viem';
import { Transport, Chain, Account } from 'viem';
import { estimateMaxPriorityFeePerGas, getBalance, getGasPrice } from 'viem/actions';
import { useNetwork } from "@/app/contexts/NetworkContext"; 
import ExtendedDetails from '../ExtendedDetails'
import { getWalletBalance } from "@/lib/solanaUtils";

import { solanaToBytes32 } from '@/lib/solanaUtils';
import { generateTxObjectForDetails } from "@/lib/activityUtils";

import { TransactionDetails } from "../TransactionDetails";
import { WithdrawDetails } from "../WithdrawDetails";
import { useTransaction } from "../TransactionPool";
import { NetworkBox } from "./NetworkBox"
import { useThirdpartyBridgeModalContext } from '../ThirdpartyBridgeModal/ThirdpartyBridgeModalContext';
import { CONTRACT_ABI, DEPOSIT_TX_GAS_LIMIT, MIN_DEPOSIT_AMOUNT, MIN_WITHDRAWAL_AMOUNT } from "../constants";
import { useWallets } from "@/app/hooks/useWallets";
import { Options } from '@/lib/networkUtils';
import { EthereumDataContext } from '@/app/context';

export interface DepositContentProps {
  modalStuff: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<React.SetStateAction<number | undefined | string>>;
}

enum Action {
  Deposit = "Deposit",
  Withdraw = "Withdraw"
}

export const DepositContent: React.FC<DepositContentProps> = ({ modalStuff, amountEther, setAmountEther }) => {
  const [walletClient, setWalletClient] = useState<WalletClient<Transport, Chain, Account> | null>(null);
  const { isThirdpartyBridgeModalOpen } = useThirdpartyBridgeModalContext(); 
  const { gasPrice, ethPrice } = useEthereumData();
  const { selectedOption, contractAddress, eclipseRpc } = useNetwork();
  const [balanceEther, setAmountBalanceEther] = useState<number>(-1);
  const [isEvmDisconnected, setIsEvmDisconnected] = useState(false);
  const [isSolDisconnected, setIsSolDisconnected] = useState(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [ethTxStatus, setEthTxStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = modalStuff; 
  const [isWithdrawFlowOpen, setIsWithdrawFlowOpen] = modalStuff; 
  const [client, setClient] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [gasPriceWei, setGasPriceWei] = useState<bigint>()
  const [maxPriorityFeePerGasWei, setMaxPriorityFeePerGasWei] = useState<bigint>()

  const { handleUnlinkWallet, rpcProviders } = useDynamicContext();
  const { addNewDeposit } = useTransaction();

  const { userWallets, evmWallet, solWallet } = useWallets();
  const isMainnet = (selectedOption === Options.Mainnet);

  const [action, setAction] = useState<Action>(Action.Deposit);
  const MIN_ACTION_AMOUNT   = action === Action.Deposit ? MIN_DEPOSIT_AMOUNT : MIN_WITHDRAWAL_AMOUNT;
  
  function switchAction() {
    setAmountEther("");     
    setAction(action === Action.Deposit ? Action.Withdraw : Action.Deposit)
  }

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
      transport: isMainnet 
        ? http("https://empty-responsive-patron.quiknode.pro/91dfa8475605dcdec9afdc8273578c9f349774a1/") 
        : http("https://ethereum-sepolia-rpc.publicnode.com"),
      cacheTime: 0
    })
    setClient(mclient);
    
    Promise.all([getGasPrice(mclient), estimateMaxPriorityFeePerGas(mclient)]).then(([gp, mpf]) => {
      setGasPriceWei(gp)
      setMaxPriorityFeePerGasWei(mpf)
    })

  }, [selectedOption])

  useEffect(() => {
    let lWalletClient = evmWallet?.connector.getWalletClient<WalletClient<Transport, Chain, Account>>();
    lWalletClient && (lWalletClient.cacheTime = 0);
    setWalletClient(lWalletClient ?? null);

  }, [evmWallet?.connector])

  useEffect(() => {
    if (!evmWallet) { setAmountBalanceEther(-1) }
  }, [evmWallet])

  useEffect(() => {
    // if action is withdraw fetch eclipse balance
    const fetchEclipse = async () => {
      const balance = await getWalletBalance(solWallet?.address || "", eclipseRpc);  
      const balanceAsEther = formatEther(BigInt(balance * (10 ** 18)));
      const formattedEtherBalance = balanceAsEther.includes('.') ? balanceAsEther.slice(0, balanceAsEther.indexOf('.') + 5) : balanceAsEther
      const balanceEther = parseFloat(formattedEtherBalance);
      setAmountBalanceEther(balanceEther);
      return;
    } 
    if (action === Action.Withdraw) {
      fetchEclipse();
    }
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
  }, [userWallets, client, action]);

  const submitWithdraw = async () => {
    setIsWithdrawFlowOpen(true);
  }

  const submitDeposit = async () => {
    setIsModalOpen(true);
    setEthTxStatus("Continue in your wallet");
    const destinationBytes32 = solanaToBytes32(solWallet?.address || '');
    const [account] = await walletClient!.getAddresses()
    const weiValue = parseEther(amountEther?.toString() || '');

    try {
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
    if (isThirdpartyBridgeModalOpen) {
      'submit-button disabled'
    }

    if (!evmWallet || !solWallet) {
      return 'submit-button disabled'
    }
    if (!amountEther) {
      return 'submit-button disabled'
    }  
    if (parseFloat(amountEther as string) < MIN_ACTION_AMOUNT) {
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
      return action
    }  
    if (parseFloat(amountEther as string) < MIN_ACTION_AMOUNT) {
      return `Min amount ${MIN_ACTION_AMOUNT} ETH`
    }

    if (parseFloat(amountEther as string) > balanceEther) {
      return 'Insufficient Funds'
    }
    
    return action; 
  }

  const networkBoxes = [
     <NetworkBox 
       key="eth"
       imageSrc="eth.png"
       direction={ action === Action.Deposit ? "From" : "To" }
       chainName={ isMainnet ? "Ethereum Mainnet" : "Ethereum Sepolia" }
       onClickEvent={() => evmWallet && handleUnlinkWallet(evmWallet.id) && setIsEvmDisconnected(!isEvmDisconnected)}
       walletChain="EVM"
       showConnect={(!evmWallet && isEvmDisconnected && !isSolDisconnected)}
       wallet={evmWallet}
       balanceEther={balanceEther}
       amountEther={amountEther}
       setAmountEther={setAmountEther}
       gasPriceWei={gasPriceWei}
       maxPriorityFeePerGasWei={maxPriorityFeePerGasWei}
     />,
     <NetworkBox 
       key="eclipse"
       imageSrc={ isMainnet ? "eclipse.png" : "eclipse-testnet.png" }
       direction={ action === Action.Deposit ? "To" : "From" }
       chainName={ isMainnet ? "Eclipse Mainnet" : "Eclipse Testnet" }
       onClickEvent={() => solWallet && handleUnlinkWallet(solWallet.id) && setIsSolDisconnected(!isSolDisconnected)}
       walletChain="SOL"
       showConnect={(!solWallet && isSolDisconnected && !isEvmDisconnected)}
       wallet={solWallet}
       balanceEther={balanceEther}
       amountEther={amountEther}
       setAmountEther={setAmountEther}
       gasPriceWei={gasPriceWei}
       maxPriorityFeePerGasWei={maxPriorityFeePerGasWei}
     />
  ]

  if (action === Action.Withdraw) {
    networkBoxes.reverse();
  }

  return (
    <>
    <div className={isModalOpen ? "status-overlay active" : "status-overlay"}></div>
    { !isModalOpen && <div>
        <div className="network-section">
          <div className="arrow-container cursor-pointer" 
               onClick={switchAction}
          >
            <TransferArrow />
          </div>

          { networkBoxes[0] }
          { networkBoxes[1] }
        </div>
        { action === Action.Deposit && <ExtendedDetails 
           amountEther={amountEther}
           target="Eclipse"
           feeInEth={gasPrice && DEPOSIT_TX_GAS_LIMIT * ((gasPrice) / 10**9)}
        /> }

        { action === Action.Withdraw && <ExtendedDetails 
           amountEther={amountEther}
           target="Ethereum"
           feeInEth={0.0000005}
        /> }
        { (!evmWallet || !solWallet) 
        ?
            <DynamicConnectButton 
                buttonClassName={`wallet-connect-button w-full`}  
                buttonContainerClassName={`submit-button connect-btn ${ isThirdpartyBridgeModalOpen ? 'disabled' : ''}`}>
              <span style={{ width: '100%' }}> {determineButtonText()}</span>
            </DynamicConnectButton>
        : 
            <button className={`w-full deposit-button p-4 ${determineButtonClass()}`} 
                  onClick={ action === Action.Deposit ? submitDeposit : submitWithdraw }
            >
              {determineButtonText()}
            </button>
        }
        </div>
    }
        
    { isModalOpen && <TransactionDetails ethStatus={ethTxStatus} from={"deposit"} tx={currentTx} closeModal={() => {
        setTimeout(() => { setIsModalOpen(false), setCurrentTx(null) }, 100);
    }} /> }

    { (isWithdrawFlowOpen && action === Action.Withdraw) && <WithdrawDetails ethStatus="completed" from="withdraw" tx={currentTx} closeModal={() => {
        setTimeout(() => { setIsWithdrawFlowOpen(false), setCurrentTx(null) }, 100);
    }} ethAmount={Number(parseEther(amountEther?.toString() || '')) / 10**18} /> }

    </>
  );
}
