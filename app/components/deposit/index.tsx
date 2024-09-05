"use client";
import { useState } from "react";
import { Activity } from "../icons";
import './styles.css';
import { DepositContent, DepositProps } from "./depositContent";
import { ActivityContent } from "./activityContent";

enum Tabs {
  Deposit,
  Withdraw,
  Activity
}

const Deposit: React.FC<DepositProps> = ({ amountEther, setAmountEther }) => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
  return (
    <div className="deposit-container">
      <div className="deposit-card">
        <div className="header-tabs">
          <div className="active header-tab" style={{ width: "43.5%" }} onClick={() => setActiveTab(Tabs.Deposit)}>Deposit</div>
          <div className="inactive header-tab" style={{ width: "43.5%" }}>Withdraw</div>
          <div className="inactive header-tab flex items-center justify-center" style={{ width: "56px" }} onClick={() => {setActiveTab(Tabs.Activity)}}>
              <Activity activityClassName="" />
          </div>
        </div>
          { activeTab === Tabs.Deposit && <DepositContent amountEther={amountEther} setAmountEther={setAmountEther}/> }
          { activeTab === Tabs.Activity && <ActivityContent /> }
        </div>
      </div>
  );
}

export default Deposit;
