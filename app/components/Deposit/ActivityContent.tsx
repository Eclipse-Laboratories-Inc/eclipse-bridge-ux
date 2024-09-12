import { useEffect, useState, useContext } from 'react';  
import { ethers } from 'ethers';
import { Arrow } from "@/app/components/icons"; 
import { TransactionIcon } from "../icons";
import { getLastDeposits, timeAgo, getNonce, checkDepositWithPDA } from "@/lib/activityUtils";
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import Skeleton from 'react-loading-skeleton'; 
import { WalletClientContext } from "@/app/context";
import { TransactionDetails } from "./TransactionDetails";  
import "./activity.css";  

export const ActivityContent = () => {
  const walletClient = useContext(WalletClientContext);
  const [deposits, setDeposits] = useState<any[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [eclipseStates, setEclipseStates] =  useState<Record<string, any>>({});

  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const evmWallet = userWallets.find(w => w.chain == "EVM");

  const getTxStatus = async (txHash: any) => {
    const data = await getNonce(walletClient, txHash);
    const onEclipseStatus = data && await checkDepositWithPDA(data);
    setEclipseStates(prevStates => ({
      ...prevStates,
      [txHash]: onEclipseStatus ? onEclipseStatus : null 
    }))
  }

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const data = await getLastDeposits(evmWallet?.address || '');
        setDeposits(data.reverse());
      } catch (error) {
        console.error("Error fetching deposits:", error);
      }
    };

    if (evmWallet) fetchDeposits();
  }, [evmWallet]);

  return ( 
    <>
    <div className={isModalOpen ? "status-overlay active" : "status-overlay"}></div>
    <div className="activity-container">
   {evmWallet && deposits && deposits.map((tx, index) => {
     const status = Number(tx.isError) ? "failed" : eclipseStates[tx.hash] ? "completed" :  (eclipseStates[tx.hash] === undefined) ? null : "loading";
     (eclipseStates[tx.hash] === undefined) && getTxStatus(tx.hash);
     return (
       <div key={index} className="deposit-transaction flex flex-row" onClick={() => { setIsModalOpen(true); setCurrentTx(tx)}}>
            <img src="swap.png" alt="Swap" className="swap-image" style={{position: "absolute", width: "22px"}} hidden />
            <img src="eth.png" alt="Ethereum" style={{ objectFit: "cover", height: "53px", width: "53px", marginLeft: "5px", marginRight: "16px"}} />
          <div className="flex flex-col justify-center" style={{width: "85%"}}>
            <div className="transaction-top flex justify-between">
              <div className="flex tx-age" style={{ gap: "7px"}}>
                <span className="gray-in">Deposit</span>
                <span className="gray-in">•</span>
                <span className="gray-in">{timeAgo(Number(tx.timeStamp))}</span>
              </div>
              <div className={`flex flex-row items-center status-div ${status}`}>
                {(status)
                  ? <><TransactionIcon iconType={status}/> 
                    <span>{status === "loading" ? "depositing" : status}</span></>
                  : <Skeleton height={15} width={91} />
                }
              </div>
            </div>
            <div className="transaction-bottom flex justify-between">
              <div className="flex flex-row items-center eth-to-ecl" style={{gap: "14px"}}>
                <span className="white-in">Ethereum</span>
                <Arrow />
                <span className="white-in">Eclipse</span>
              </div>
              <span className="white-in">{Number(ethers.utils.formatEther(tx.value)).toFixed(3)} ETH</span>
            </div>
          </div>
      </div>
    )})}
    {(!evmWallet) ? <span>Connect your evm wallet first.</span> : (!(deposits?.length) && <span>You don&apos;t have any transactions.</span>)}
    </div> 
    { isModalOpen && <TransactionDetails fromDeposit={false} tx={currentTx} closeModal={() => setTimeout(() => setIsModalOpen(false), 100)} /> }
    </>
  )
}
