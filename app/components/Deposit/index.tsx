"use client";
import { useState } from "react";
import { Activity, Loading } from "../icons";
import './styles.css';
import { DepositContent } from "./DepositContent";
import { ActivityContent } from "./ActivityContent";
import { useTransaction } from "../TransactionPool"
import ExtendedDetails from '../ExtendedDetails'
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import classNames from 'classnames';

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
  const [hasActiveTx, setHasActiveTx] = useState(false);
  const { pendingTransactions } = useTransaction();
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const evmWallet = userWallets.find(w => w.chain == "EVM");

  return (
    <>
    <div className="deposit-container flex flex-col">
      <div className="deposit-card" style={{width: isModalOpen ? "0px" : "inherit"}}>
        <div className="header-tabs">
          <div className={classNames("header-tab", (activeTab === Tabs.Deposit ? "active" : "inactive"))} style={{ width: "100%" }} onClick={() => setActiveTab(Tabs.Deposit)}>Deposit</div>
          <div className={classNames("header-tab", "disabled", (activeTab === Tabs.Withdraw ? "active" : "inactive"))} style={{ width: "100%" }}>Withdraw</div>
          { evmWallet && <div className={classNames("header-tab", "flex", "items-center", "justify-center", (activeTab === Tabs.Activity ? "active" : "inactive"))} style={{ width: "131px" }} onClick={() => {setActiveTab(Tabs.Activity)}}>
          { (pendingTransactions.length === 0 )
            ? <Activity activityClassName="" />
            : <Loading loadingClassName="" />
          }
          </div>}
        </div>
          { activeTab === Tabs.Deposit && 
              <DepositContent activeTxState={[hasActiveTx, setHasActiveTx]} modalStuff={[isModalOpen, setIsModalOpen]} amountEther={amountEther} setAmountEther={setAmountEther}/> }
          { activeTab === Tabs.Activity && <ActivityContent setActiveTab={setActiveTab}/> }
        </div>
      { (activeTab === Tabs.Deposit) && !isModalOpen && <ExtendedDetails amountEther={amountEther} /> }
      </div>
    </>
  );
}

export default Deposit;
