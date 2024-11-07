import classNames from "classnames";
import { useState } from "react";
import { Mint } from "./Mint";
import { Redeem } from "./Redeem";
import "./styles.css";

export enum Tabs {
  Mint,
  Redeem,
}

function MintAndRedeem() {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Mint);

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
            </div>
            {activeTab === Tabs.Mint && <Mint />}
            {activeTab === Tabs.Redeem && <Redeem />}
          </div>
        </div>
      </div>
    </>
  );
}

export default MintAndRedeem;
