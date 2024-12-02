import { useState } from 'react';  
import { ethers } from 'ethers';
import { Arrow } from "@/app/components/icons"; 
import { TransactionIcon, ActivityBoxIcon, Activity } from "../icons";
import { timeAgo, timeLeft } from "@/lib/activityUtils";
import Skeleton from 'react-loading-skeleton'; 
import { TransactionDetails } from "../TransactionDetails";  
import { useTransaction } from "../TransactionPool"
import { Tabs } from "./index";
import "./activity.css";  
import { useWallets } from '@/app/hooks/useWallets';
import { WithdrawDetails } from '../WithdrawDetails';

export const ActivityContent = ({ setActiveTab }: {setActiveTab: React.Dispatch<React.SetStateAction<Tabs>>}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const { transactions, deposits, withdrawals, withdrawTransactions } = useTransaction();

  const { evmWallet } = useWallets();

  if (!evmWallet) {  
    setActiveTab(Tabs.Deposit); 
    return <></>
  }
     
  return ( 
    <>
    <div className={isModalOpen || isWithdrawModalOpen ? "status-overlay active" : "status-overlay"}></div>
    <div className="activity-container">
    { evmWallet && withdrawals && withdrawals.map((w, i) => {
      const wStatus = w[1];
      const amount  = ethers.utils.formatEther(w[0].message.amount_wei); 
      const withdraw_obj = withdrawTransactions.get(w[0].message.withdraw_id);

      return (
       <div key={i} className="deposit-transaction flex flex-row items-center" onClick={() => { setCurrentTx(w); setIsWithdrawModalOpen(true) }}>
            <img src="swap.png" alt="Swap" className="swap-image" style={{position: "absolute", width: "22px"}} hidden />
            <img src="eth.png" alt="Ethereum" style={{ objectFit: "cover", height: "53px", width: "53px", marginLeft: "5px", marginRight: "16px"}} />
          <div className="flex flex-col justify-center w-[85%] gap-[4px]">
            <div className="transaction-top flex justify-between">
              <div className="flex tx-age" style={{ gap: "7px"}}>
                <span className="gray-in">Withdraw</span>
                <span className="gray-in">•</span>
                <span className="gray-in">{ withdraw_obj?.transaction && timeAgo(Number(withdraw_obj?.transaction.blockTime)) }</span>
              </div>
                {
                  (wStatus === 'Pending') && <div className="flex items-center bg-[#A1FEA0] rounded-[13px] py-[3px] px-[8px] text-black text-[12px]">
                    Claim Now
                  </div>
                }
                {
                  (wStatus === 'Processing') && <div className="flex flex-row items-center text-[12px] rounded-[13px] bg-[#ffffff0d] p-[3px] pr-[8px] pl-[4px] gap-[6px]">
                    <Activity activityClassName="w-[14px]" />
                    <span className="text-[#ffffff4d]">Processing</span>
                    <span className="text-[#A1FEA0]">~ {timeLeft(parseInt(w[0].start_time, 16) * 1000)}</span>
                  </div>
                }
                { 
                  (wStatus === 'Closed') && <div className="
                        flex flex-row rounded-[13px] 
                        px-[8px] py-[3px] bg-[#a1fea00d]
                        text-[12px] text-[#A1FEA0]
                        items-center gap-[6px]
                  ">
                    <TransactionIcon iconType="completed" className="w-[14px]" />
                    <span>Completed</span>
                  </div>
                }
            </div>
            <div className="transaction-bottom flex justify-between">
              <div className="flex flex-row items-center eth-to-ecl" style={{gap: "14px"}}>
                <span className="white-in">Eclipse</span>
                <Arrow />
                <span className="white-in">Ethereum</span>
              </div>
              <span className="white-in">{ parseFloat(amount).toFixed(3) } ETH</span>
            </div>
          </div>
      </div>)
    })}
    
   {evmWallet && deposits && deposits.map((tx, index) => {
     const pdaData = transactions.get(tx.hash)?.pdaData;
     const status = Number(tx.isError) 
       ? "failed" 
       : pdaData 
         ? "completed" 
         : (pdaData === undefined) 
           ? null 
           : "loading";

     return (
       <div key={index} className="deposit-transaction flex flex-row items-center" onClick={() => { setIsModalOpen(true); setCurrentTx(tx)}}>
            <img src="swap.png" alt="Swap" className="swap-image" style={{position: "absolute", width: "22px"}} hidden />
            <img src="eth.png" alt="Ethereum" style={{ objectFit: "cover", height: "53px", width: "53px", marginLeft: "5px", marginRight: "16px"}} />
          <div className="flex flex-col justify-center w-[85%] gap-[4px]">
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
      : (!(deposits?.length) && !(withdrawals?.length) 
        && <div className="flex flex-col items-center justify-center" style={{height: "90%", gap: "21px"}}>
          <ActivityBoxIcon activityBoxClassName="" />
          <span style={{fontSize: "18px", color: "rgba(255, 255, 255, 0.3)", fontWeight: "500", width: "266px"}}>You don’t have any transactions to show</span> 
        </div>
    )}
    </div> 
      { isModalOpen && <TransactionDetails from={""} tx={currentTx} closeModal={() => setTimeout(() => setIsModalOpen(false), 100)} /> }
      { isWithdrawModalOpen && <WithdrawDetails from='withdraw' tx={currentTx} ethAmount={0} closeModal={() => setTimeout(() => setIsWithdrawModalOpen(false), 100)} /> }
    </>
  )
}
