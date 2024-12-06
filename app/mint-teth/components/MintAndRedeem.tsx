import classNames from "classnames";
import { useState } from "react";
import { Mint } from "./Mint";
import { Redeem } from "./Redeem";
import "./styles.css";
import { NucleusActivityContent } from "./NucleusActivityContent";
import { Activity } from "@/app/components/icons";
import { useTransactions } from "../hooks/useTransactions";

export enum Tabs {
  Mint,
  Redeem,
  Activity,
}

function MintAndRedeem() {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Mint);
  const { transactions, isLoading } = useTransactions();

  return (
    <>
      <div>
        <div className="deposit-container flex flex-col">
          <div className="deposit-card">
            <div className="header-tabs">
              <div
                className={classNames("header-tab", activeTab === Tabs.Mint ? "active" : "inactive")}
                style={{ width: "100%" }}
                onClick={() => setActiveTab(Tabs.Mint)}
              >
                Mint
              </div>
              <div
                className={classNames("header-tab", activeTab === Tabs.Redeem ? "active" : "inactive")}
                style={{ width: "100%" }}
                onClick={() => setActiveTab(Tabs.Redeem)}
              >
                Redeem
              </div>
              <div
                className={classNames(
                  "header-tab",
                  "flex",
                  "items-center",
                  "justify-center",
                  activeTab === Tabs.Activity ? "active" : "inactive"
                )}
                style={{ width: "131px" }}
                onClick={() => {
                  setActiveTab(Tabs.Activity);
                }}
              >
                <Activity activityClassName="" />
              </div>
            </div>
            {activeTab === Tabs.Mint && <Mint />}
            {activeTab === Tabs.Redeem && <Redeem />}
            {activeTab === Tabs.Activity && (
              <NucleusActivityContent transactions={transactions} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MintAndRedeem;
