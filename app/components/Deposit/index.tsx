"use client";

import './styles.css';
import { useState, useContext } from "react";
import LrtPopup from "./LrtPopup"
import { Activity, Loading } from "../icons";
import { DepositContent } from "./DepositContent";
import { ActivityContent } from "./ActivityContent";
import { useTransaction } from "../TransactionPool"
import ExtendedDetails from '../ExtendedDetails'
import classNames from 'classnames';
import  { EclipseWalletContext } from "@/app/context";
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
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const { eclipseAddr, setEclipseAddr } = useContext(EclipseWalletContext); 

  const { pendingTransactions } = useTransaction();
  const { evmWallet } = useWallets();

  return (
    <>
    <div className="deposit-container flex flex-col">
      <div className="deposit-card" style={{
          width: isModalOpen ? "0px" : "inherit", 
          paddingRight: activeTab === Tabs.Activity ? "8px" : "20px"
      }}>
        
        { !isModalOpen && <LrtPopup /> }
      
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
          { activeTab === Tabs.Deposit && 
              <DepositContent 
                modalStuff={[isModalOpen, setIsModalOpen]} 
                amountEther={amountEther} 
                setAmountEther={setAmountEther}
                eclipseAddr={eclipseAddr}
                setEclipseAddr={setEclipseAddr} 
          />}
          { activeTab === Tabs.Activity && <ActivityContent setActiveTab={setActiveTab}/> }
        </div>
      { (activeTab === Tabs.Deposit) && !isModalOpen && 
        <ExtendedDetails 
          amountEther={amountEther}
          eclipseAddr={eclipseAddr} /> 
      }
      </div>
    </>
  );
}

export default Deposit;
