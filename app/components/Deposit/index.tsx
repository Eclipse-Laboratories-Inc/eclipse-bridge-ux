"use client";
import { useState } from "react";
import { Activity } from "../icons";
import './styles.css';
import { DepositContent, DepositProps } from "./DepositContent";
import { ActivityContent } from "./ActivityContent";
import ExtendedDetails from '../ExtendedDetails'
import classNames from 'classnames';

enum Tabs {
  Deposit,
  Withdraw,
  Activity
}

const Deposit: React.FC<DepositProps> = ({ amountEther, setAmountEther }) => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  return (
    <>
    <div className="deposit-container flex flex-col">
      <div className="deposit-card" style={{width: isModalOpen ? "0px" : "inherit"}}>
        <div className="header-tabs">
          <div className={classNames("header-tab", (activeTab === Tabs.Deposit ? "active" : "inactive"))} style={{ width: "43.5%" }} onClick={() => setActiveTab(Tabs.Deposit)}>Deposit</div>
          <div className={classNames("header-tab", "disabled", (activeTab === Tabs.Withdraw ? "active" : "inactive"))} style={{ width: "43.5%" }}>Withdraw</div>
          <div className={classNames("header-tab", "flex", "items-center", "justify-center", (activeTab === Tabs.Activity ? "active" : "inactive"))} style={{ width: "56px" }} onClick={() => {setActiveTab(Tabs.Activity)}}>
              <Activity activityClassName="" />
          </div>
        </div>
          { activeTab === Tabs.Deposit && <DepositContent modalStuff={[isModalOpen, setIsModalOpen]} amountEther={amountEther} setAmountEther={setAmountEther}/> }
          { activeTab === Tabs.Activity && <ActivityContent /> }
        </div>
      { (activeTab === Tabs.Deposit) && !isModalOpen && <ExtendedDetails amountEther={amountEther} /> }
      </div>
    </>
  );
}

export default Deposit;
