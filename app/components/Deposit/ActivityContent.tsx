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


export const ActivityItem = ({ openModalEvent, transactionType, transactionTime, transactionStatusPill, transactionAmount }: {
  openModalEvent: () => void,
  transactionType: String,
  transactionTime: String,
  transactionStatusPill: React.ReactElement,
  transactionAmount: String
}) => {
    return (
       <div key="key123" className="deposit-transaction flex flex-row items-center" onClick={openModalEvent}>
            <img src="swap.png" alt="Swap" className="swap-image" style={{position: "absolute", width: "22px"}} hidden />
            <img src="eth.png" alt="Ethereum" className="object-cover h-[53px] w-[53px] ml-[5px] mr-[16px]" />
          <div className="flex flex-col justify-center w-[85%] gap-[4px]">
            <div className="transaction-top flex justify-between">
              <div className="flex tx-age gap-[7px]">
                <span className="gray-in">{ transactionType }</span>
                <span className="gray-in">•</span>
                <span className="gray-in">{ transactionTime }</span>
              </div>
              { transactionStatusPill } 
            </div>
            <div className="transaction-bottom flex justify-between">
              <div className="flex flex-row items-center eth-to-ecl gap-[14px]">
                <span className="white-in">Eclipse</span>
                <Arrow />
                <span className="white-in">Ethereum</span>
              </div>
              <span className="white-in">{ transactionAmount }</span>
            </div>
          </div>
      </div>
    );
}

function getWithdrawalActivityPill(status: String, timeLeft?: String) {
  if (status === "Pending") {
    return (
      <div className="flex items-center bg-[#A1FEA0] rounded-[13px] py-[3px] px-[8px] text-black text-[12px]">
        Claim Now
      </div>
    );
  }

  if (status === "Processing") {
    return (
      <div className="flex flex-row items-center text-[12px] rounded-[13px] bg-[#ffffff0d] p-[3px] pr-[8px] pl-[4px] gap-[6px]">
        <Activity activityClassName="w-[14px]" />
        <span className="text-[#ffffff4d]">Processing</span>
        <span className="text-[#A1FEA0]">~ { timeLeft }</span>
      </div>
    );
  }

  return (
    <div className="
          flex flex-row rounded-[13px] 
          px-[8px] py-[3px] bg-[#a1fea00d]
          text-[12px] text-[#A1FEA0]
          items-center gap-[6px]
    ">
      <TransactionIcon iconType="completed" className="w-[14px]" />
      <span>Completed</span>
    </div>
  );
}

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

  const combinedTransactions = [
    ...(withdrawals || []).map((w) => ({
      type: "withdrawal",
      data: w,
      timestamp: withdrawTransactions.get(w[0].message.withdraw_id)?.transaction?.blockTime || 0,
    })),
    ...(deposits || []).map((tx) => ({
      type: "deposit",
      data: tx,
      timestamp: Number(tx.timeStamp),
    })),
  ];
  combinedTransactions.sort((a, b) => {
    if (a.type === "withdrawal" && a.data[1] === "Pending") {
      if (b.type === "withdrawal" && b.data[1] === "Pending") {
        return b.timestamp - a.timestamp;
      }
      return -1; 
    }

    if (b.type === "withdrawal" && b.data[1] === "Pending") {
      return 1; 
    }

    return b.timestamp - a.timestamp;
  });


  return ( 
    <>
    <div className={isModalOpen || isWithdrawModalOpen ? "status-overlay active" : "status-overlay"}></div>
    <div className="activity-container">


    {
      combinedTransactions && combinedTransactions.map((activity, index) => {
        if ( activity.type === "withdrawal" ) {
          const withdraw_message = activity.data[0].message;
          const withdraw_obj = withdrawTransactions.get(withdraw_message.withdraw_id);
          const amount  = ethers.utils.formatEther(withdraw_message.amount_wei); 
          const claimTime = timeLeft(parseInt(activity.data[0].start_time, 16) * 1000)

          return (
            <ActivityItem 
               openModalEvent={() => { setCurrentTx(activity.data); setIsWithdrawModalOpen(true)}} 
               transactionType="Withdraw"
               transactionTime={ withdraw_obj?.transaction && timeAgo(Number(withdraw_obj?.transaction.blockTime)) }
               transactionAmount={ `${parseFloat(amount).toFixed(3)} ETH` }
               transactionStatusPill={getWithdrawalActivityPill(activity.data[1], claimTime)}
            />
          );
        }

        if ( activity.type === "deposit" ) {
          const transaction = activity.data;
          const pdaData = transactions.get(transaction.hash)?.pdaData;

          const status = Number(transaction.isError) 
            ? "failed" 
            : pdaData 
            ? "completed" 
            : (pdaData === undefined) 
            ? null 
            : "loading";

          const statusPill = (
            <div className={`flex flex-row items-center status-div ${status}`}>
              {(status)
                ? <><TransactionIcon iconType={status}/> 
                  <span>{status === "loading" ? "depositing" : status}</span></>
                : <Skeleton height={15} width={91} />
              }
            </div>
          );
          return (
            <ActivityItem 
               openModalEvent={() => {() => { setIsModalOpen(true); setCurrentTx(transaction)}}} 
               transactionType="Deposit"
               transactionTime={ timeAgo(Number(transaction.timeStamp)) }
               transactionAmount={ `${Number(ethers.utils.formatEther(transaction.value)).toFixed(3)} ETH` }
               transactionStatusPill={statusPill}
            />
          );
        }
      })
    }
    
    {(!evmWallet) 
      ? <span>Connect your evm wallet first.</span> 
      : (!(deposits?.length) && !(withdrawals?.length) 
        && <div className="flex flex-col items-center justify-center gap-[21px] h-[90%]">
          <ActivityBoxIcon activityBoxClassName="" />
          <span className="text-lg text-[#ffffff4d] font-medium w-[266px]">
            You don’t have any transactions to show
          </span> 
        </div>
    )}

    </div> 
      { isModalOpen && <TransactionDetails from="" tx={currentTx} closeModal={() => setTimeout(() => setIsModalOpen(false), 100)} /> }
      { isWithdrawModalOpen && <WithdrawDetails from="withdraw" tx={currentTx} ethAmount={0} closeModal={() => setTimeout(() => setIsWithdrawModalOpen(false), 100)} /> }
    </>
  )
}
