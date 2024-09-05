"use client";
import { useState } from "react";
import { Activity } from "../icons";
import './styles.css';
import { DepositContent, DepositProps } from "./depositContent";
import { ActivityContent } from "./activityContent";
import { TransactionDetails } from "./transactionDetails";
import classNames from 'classnames';

enum Tabs {
  Deposit,
  Withdraw,
  Activity
}

const Deposit: React.FC<DepositProps> = ({ amountEther, setAmountEther }) => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
  return (
    <>
    <div className="deposit-container" style={{display: "none"}}>
      <div className="deposit-card">
        <div className="header-tabs">
          <div className={classNames("header-tab", (activeTab === Tabs.Deposit ? "active" : "inactive"))} style={{ width: "43.5%" }} onClick={() => setActiveTab(Tabs.Deposit)}>Deposit</div>
          <div className={classNames("header-tab", (activeTab === Tabs.Withdraw ? "active" : "inactive"))} style={{ width: "43.5%" }}>Withdraw</div>
          <div className={classNames("header-tab", "flex", "items-center", "justify-center", (activeTab === Tabs.Activity ? "active" : "inactive"))} style={{ width: "56px" }} onClick={() => {setActiveTab(Tabs.Activity)}}>
              <Activity activityClassName="" />
          </div>
        </div>
          { activeTab === Tabs.Deposit && <DepositContent amountEther={amountEther} setAmountEther={setAmountEther}/> }
          { activeTab === Tabs.Activity && <ActivityContent /> }
        </div>
      </div>
      <TransactionDetails />
      </>
  );
}

export default Deposit;
