"use client";

import "./styles.css";
import React, { useEffect } from "react";
import TapPopup from "./TapPopup";
import "./styles.css";
import { useState } from "react";
import classNames from "classnames";
import { Activity, Loading, InstantIcon } from "../icons";
import { DepositContent } from "./DepositContent";
import { ActivityContent } from "./ActivityContent";
import { RelaySwapWidget } from "@/app/components/Deposit/RelaySwapWidget";
import { useTransaction } from "../TransactionPool";
import { ThirdpartyBridgesPill } from "../ThirdpartyBridgeModal";
import { useWallets } from "@/app/hooks/useWallets";
import { useThirdpartyBridgeModalContext } from "../ThirdpartyBridgeModal/ThirdpartyBridgeModalContext";
import { useSearchParams } from "react-router-dom";

export enum Tabs {
  Deposit = "deposit",
  Relay = "instant",
  Activity = "activity",
}

export interface DepositProps {
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<
    React.SetStateAction<number | undefined | string>
  >;
}

const Deposit: React.FC<DepositProps> = ({ amountEther, setAmountEther }) => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
  const [urlParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { pendingTransactions } = useTransaction();
  const { isThirdpartyBridgeModalOpen, setIsThirdpartyBridgeModalOpen } =
    useThirdpartyBridgeModalContext();
  const { evmWallet } = useWallets();

  useEffect(() => {
    const targetTab = urlParams.get("target");

    if (Object.values(Tabs).includes(targetTab as Tabs)) {
      setActiveTab(targetTab as Tabs);
    }
  }, []);

  useEffect(() => {
    urlParams.set("target", activeTab.toString());
  }, [activeTab]);

  return (
    <>
      <div
        className="deposit-container flex flex-col"
        style={{ transform: isThirdpartyBridgeModalOpen ? "scale(0.9)" : "" }}
      >
        <div
          className="deposit-card"
          style={{
            width: isModalOpen ? "0px" : "",
            paddingRight: activeTab === Tabs.Activity ? "8px" : "20px",
          }}
        >
          {!isModalOpen && <TapPopup />}

          <div
            className="header-tabs"
            style={{
              marginRight: activeTab === Tabs.Activity ? "12px" : "0px",
            }}
          >
            <div
              className={classNames(
                "header-tab w-full",
                activeTab === Tabs.Deposit ? "active" : "inactive",
              )}
              onClick={() => setActiveTab(Tabs.Deposit)}
            >
              Bridge
            </div>
            <div
              className={classNames(
                "header-tab w-full flex items-center justify-center gap-[6px]",
                activeTab === Tabs.Relay ? "active" : "inactive",
              )}
              onClick={() => {
                setActiveTab(Tabs.Relay);
              }}
            >
              <InstantIcon className="" />
              Instant
            </div>
            {evmWallet && (
              <div
                className={classNames(
                  "flex header-tab w-[131px] items-center justify-center",
                  activeTab === Tabs.Activity ? "active" : "inactive",
                )}
                onClick={() => {
                  setActiveTab(Tabs.Activity);
                }}
              >
                {pendingTransactions.length === 0 ? (
                  <Activity activityClassName="activity-icon" />
                ) : (
                  <Loading style={{}} loadingClassName="" />
                )}
              </div>
            )}
          </div>
          {activeTab === Tabs.Deposit && (
            <DepositContent
              modalStuff={[isModalOpen, setIsModalOpen]}
              amountEther={amountEther}
              setAmountEther={setAmountEther}
            />
          )}
          {activeTab === Tabs.Relay && <RelaySwapWidget />}
          {activeTab === Tabs.Activity && (
            <ActivityContent setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
      <div
        onClick={() => setIsThirdpartyBridgeModalOpen(true)}
        className="mt-[20px]"
      >
        <ThirdpartyBridgesPill />
      </div>
    </>
  );
};

export default Deposit;
