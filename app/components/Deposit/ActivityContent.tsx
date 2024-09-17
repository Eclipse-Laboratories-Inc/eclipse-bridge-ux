import { useState } from 'react';  
import { ethers } from 'ethers';
import { Arrow } from "@/app/components/icons"; 
import { TransactionIcon, ActivityBoxIcon } from "../icons";
import { timeAgo } from "@/lib/activityUtils";
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import Skeleton from 'react-loading-skeleton'; 
import { TransactionDetails } from "./TransactionDetails";  
import { useTransaction } from "../TransactionPool"
import { Tabs } from "./index";
import "./activity.css";  

export const ActivityContent = ({ setActiveTab }: {setActiveTab: React.Dispatch<React.SetStateAction<Tabs>>}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const { transactions, deposits } = useTransaction();

  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const evmWallet = userWallets.find(w => w.chain == "EVM");

  if (!evmWallet)  
    return setActiveTab(Tabs.Deposit); 
     
  return ( 
    <>
    <div className={isModalOpen ? "status-overlay active" : "status-overlay"}></div>
    <div className="activity-container">
   {evmWallet && deposits && deposits.map((tx, index) => {
     const status = Number(tx.isError) ? "failed" : transactions.get(tx.hash)?.pdaData ? "completed" :  (transactions.get(tx.hash)?.pdaData === undefined) ? null : "loading";
     return (
       <div key={index} className="deposit-transaction flex flex-row items-center" onClick={() => { setIsModalOpen(true); setCurrentTx(tx)}}>
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
    {(!evmWallet) 
      ? <span>Connect your evm wallet first.</span> 
      : (!(deposits?.length)
        && <div className="flex flex-col items-center justify-center" style={{height: "90%", gap: "21px"}}>
          <ActivityBoxIcon activityBoxClassName="" />
          <span style={{fontSize: "18px", color: "rgba(255, 255, 255, 0.3)", fontWeight: "500", width: "266px"}}>You don’t have any transactions to show</span> 
        </div>
    )}
    </div> 
    { isModalOpen && <TransactionDetails fromDeposit={false} tx={currentTx} closeModal={() => setTimeout(() => setIsModalOpen(false), 100)} /> }
    </>
  )
}
