"use client";
import config from "@/config"
import React, { useEffect, useState, useCallback, useContext } from 'react';
import './styles.css';
import TransferArrow from '../icons/transferArrow';
import {
  DynamicConnectButton,
  useUserWallets,
  useDynamicContext,
  Wallet,
} from "@dynamic-labs/sdk-react-core";
import { Cross, Loading, ConnectIcon } from "../icons";
import { createPublicClient, formatEther, http, parseEther } from 'viem'
import { getBalance } from 'viem/actions';
import { truncateWalletAddress } from '@/lib/stringUtils';
import { solanaToBytes32 } from '@/lib/solanaUtils'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { generateTxObjectForDetails } from "@/lib/activityUtils";
import { TransactionDetails } from "./TransactionDetails";
import { WalletClientContext, EthereumDataContext} from "@/app/context";

const CONTRACT_ADDRESS = config.bridgeContract;
const MIN_DEPOSIT_AMOUNT = 0.002;

const CONTRACT_ABI = [{
      inputs: [{
          internalType: 'bytes32',
          name: '',
          type: 'bytes32'
      }, {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
      }, ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
}];

const client = createPublicClient({
  chain: config.currentChain,
  transport: http(),
})

export interface DepositContentProps {
  modalStuff: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<React.SetStateAction<number | undefined | string>>;
}

export const DepositContent: React.FC<DepositContentProps> = ({ modalStuff, amountEther, setAmountEther }) => {
  const [gasPrice, ethPrice] = useContext(EthereumDataContext) ?? [null, null];
  const walletClient = useContext(WalletClientContext);
  const [balanceEther, setAmountBalanceEther] = useState<number>(-1);
  const [isMmPopup, setIsMmPopup] = useState(false);
  const [isEvmDisconnected, setIsEvmDisconnected] = useState(false);
  const [isSolDisconnected, setIsSolDisconnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = modalStuff; 
  const [currentTx, setCurrentTx] = useState<any>(null);

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


  const submitDeposit = async () => {
    const destinationBytes32 = solanaToBytes32(solWallet?.address || '');
    const [account] = await walletClient.getAddresses()
    const weiValue = parseEther(amountEther?.toString() || '');
    setIsMmPopup(true);

    try {
      const { request } = await client.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'deposit',
        args: [destinationBytes32, weiValue],
        account,
        value: weiValue
      })
      setIsModalOpen(true);
      const txResponse = await walletClient.writeContract(request);
      const txData = await generateTxObjectForDetails(walletClient, txResponse);

      setCurrentTx(txData);
      setIsModalOpen(true);

      setIsMmPopup(false)
    } catch (error) {
      setIsMmPopup(false)
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
    if (isMmPopup) {
      return 'submit-button waiting'
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
    if (isMmPopup) {
      return "Confirm transaction in your wallet"
    }
    if (!amountEther) {
      return 'Deposit'
    }  
    if (parseFloat(amountEther as string) < MIN_DEPOSIT_AMOUNT) {
      return 'Min amount 0.002 ETH'
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
                <div onClick={() => evmWallet && handleUnlinkWallet(evmWallet.id) && setIsEvmDisconnected(!isEvmDisconnected)} className="disconnect">
                  <Cross crossClassName="deposit-cross" />
                  <div>Disconnect</div>
                </div>
                <div className="wallet-addresss">{truncateWalletAddress(userWallets.find(w => w.chain == "EVM")?.address || '')}</div>
              </div>}
              { (!evmWallet && isEvmDisconnected)
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
                <div onClick={() => solWallet && handleUnlinkWallet(solWallet.id) && setIsSolDisconnected(!isSolDisconnected)} className="disconnect">
                  <Cross crossClassName="deposit-cross" />
                  <div>Disconnect</div>
                </div>
                <div className="wallet-addresss">{truncateWalletAddress(solWallet?.address || '')}</div>
              </div>}
              { (!solWallet && isSolDisconnected)
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
            : <Skeleton height={40} width={160} />
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
                :  <span style={{width: "20%"}}><Skeleton inline={true}/></span>
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
              <span style={{ width: '100%' }}> {determineButtonText()}</span>
            </DynamicConnectButton>
        : 
            <button className={`w-full deposit-button p-4 ${determineButtonClass()}`} onClick={submitDeposit}>
            {(isMmPopup) ? <Loading loadingClassName="loading-animation" />  : null }
              {determineButtonText()}
            </button>
        }
        </div>
    }
        
    { isModalOpen && <TransactionDetails fromDeposit={true} tx={currentTx} closeModal={() => {
        setTimeout(() => { setIsModalOpen(false), setCurrentTx(null) }, 100);
    }} /> }
    </>
  );
};

