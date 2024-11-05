"use client";

import React, { useContext } from 'react';
import LrtPopup from "./LrtPopup"
import  { EthereumDataContext } from "@/app/context";
import './styles.css';
import { useState } from "react";
import { Activity, Loading } from "../icons";
import { DepositContent } from "./DepositContent";
import { WithdrawContent } from "./WithdrawContent";
import { ActivityContent } from "./ActivityContent";
import { useTransaction } from "../TransactionPool"
import classNames from 'classnames';
import { useWallets } from '@/app/hooks/useWallets';
import { callExampleFunction } from "@/lib/withdrawUtils"

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
  const { evmWallet, solWallet } = useWallets();

  return (
    <>
    <div className="deposit-container flex flex-col">
      <div className="deposit-card" style={{
          width: isModalOpen ? "0px" : "inherit", 
          paddingRight: activeTab === Tabs.Activity ? "8px" : "20px"
      }}>
        <button className="flex w-[500px] h-[50px]" onClick={() => {
          callExampleFunction(solWallet?.connector.getSigner());
        }}>YARAK</button>
        <LrtPopup />

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
      </div>
    </>
  );
}

export default Deposit;
