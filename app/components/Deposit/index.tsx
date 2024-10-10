"use client";

import React, { useContext, useEffect } from 'react';
import  { EthereumDataContext } from "@/app/context";
import './styles.css';
import { useState } from "react";
import { Activity, Loading, Cross } from "../icons";
import { DepositContent } from "./DepositContent";
import { WithdrawContent } from "./WithdrawContent";
import { ActivityContent } from "./ActivityContent";
import { useTransaction } from "../TransactionPool"
import ExtendedDetails from '../ExtendedDetails'
import classNames from 'classnames';
import { useWallets } from '@/app/hooks/useWallets';

export enum Tabs {
  Deposit,
  Withdraw,
  Activity
}

export interface DepositProps {
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<React.SetStateAction<number | undefined | string>>;
}

const Deposit: React.FC<DepositProps> = ({ amountEther, setAmountEther }) => {
  const [gasPrice, ethPrice] = useContext(EthereumDataContext) ?? [null, null];
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const { pendingTransactions } = useTransaction();
  const { evmWallet } = useWallets();

  const [lrtVisible, setLrtVisible] = useState<boolean>(false);

  useEffect(() => {
    const popupClosed = localStorage.getItem('lrtPopup');
    console.log(popupClosed, "orrrcoo")
    if (popupClosed === null) {
      setLrtVisible(true);
    }
  }, []);

  const closePopup = () => {
    setLrtVisible(false);
    localStorage.setItem('lrtPopup', 'true');
  };

  return (
    <>
    <div className="deposit-container flex flex-col">
      <div className="deposit-card" style={{
          width: isModalOpen ? "0px" : "inherit", 
          paddingRight: activeTab === Tabs.Activity ? "8px" : "20px"
      }}>

      { lrtVisible && 
        <>
          <div className="lrt-box flex flex-row justify-between items-center">
            <div className="flex flex-col justify-between h-full">
              <span className="text-[20px] font-semibold w-[247px] h-[52px] text-left line-[26px]" style={{lineHeight: "26px"}}>Deposit your LRTs to earn restaked yield</span>
              <span className="text-[14px] font-medium text-left" style={{ color: "rgba(161, 254, 160, 1)"}}>Deposit Now</span> 
            </div>
            <div>
              <img src="lrt.svg" alt="LRT image." className="h-[99px]" />
            </div>
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>
            <div className="circle circle4"></div>
            <div onClick={closePopup}><Cross crossClassName='lrt-cross' /></div>
          </div>
          <div className="dash-box" ></div>
        </>
      }

        <div className="header-tabs" style={{
          marginRight: activeTab === Tabs.Activity ? "12px" : "0px"
        }}>
          <div className={classNames("header-tab", (activeTab === Tabs.Deposit ? "active" : "inactive"))} style={{ width: "100%" }} onClick={() => setActiveTab(Tabs.Deposit)}>Deposit</div>
          <div className={classNames("header-tab", "disabled", (activeTab === Tabs.Withdraw ? "active" : "inactive"))} style={{ width: "100%" }}>Withdraw</div>
          { evmWallet && <div className={classNames("header-tab", "flex", "items-center", "justify-center", (activeTab === Tabs.Activity ? "active" : "inactive"))} style={{ width: "131px" }} onClick={() => {setActiveTab(Tabs.Activity)}}>
          { (pendingTransactions.length === 0 )
            ? <Activity activityClassName="" />
            : <Loading style={{}} loadingClassName="" />
          }
          </div>}
        </div>
          { activeTab === Tabs.Deposit  && <DepositContent  modalStuff={[isModalOpen, setIsModalOpen]} amountEther={amountEther} setAmountEther={setAmountEther}/> }
          { activeTab === Tabs.Withdraw && <WithdrawContent modalStuff={[isModalOpen, setIsModalOpen]} amountEther={amountEther} setAmountEther={setAmountEther}/> }
          { activeTab === Tabs.Activity && <ActivityContent setActiveTab={setActiveTab}/> }
        </div>
      { (activeTab === Tabs.Deposit) && !isModalOpen && 
        <ExtendedDetails 
            amountEther={amountEther}
            target="Eclipse"
            feeInEth={gasPrice && 113200 * (gasPrice) / 10**9}
      /> }
      { (activeTab === Tabs.Withdraw) && !isModalOpen && 
        <ExtendedDetails 
            amountEther={amountEther} 
            target="Ethereum"
            feeInEth={0.00000005}
      /> }
      </div>
    </>
  );
}

export default Deposit;
