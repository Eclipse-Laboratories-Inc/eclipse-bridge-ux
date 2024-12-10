"use client";

import React from "react";
import LrtPopup from "./LrtPopup";
import "./styles.css";
import { useState } from "react";
import classNames from "classnames";
import { Activity, Loading } from "../icons";
import { DepositContent } from "./DepositContent";
import { ActivityContent } from "./ActivityContent";
import { RelaySwapWidget } from "@/app/components/Deposit/RelaySwapWidget";
import { useTransaction } from "../TransactionPool";
import { ThirdpartyBridgesPill } from "../ThirdpartyBridgeModal";
import { useWallets } from "@/app/hooks/useWallets";
import { useThirdpartyBridgeModalContext } from "../ThirdpartyBridgeModal/ThirdpartyBridgeModalContext";

export enum Tabs {
  Deposit,
  Relay,
  Activity,
}

export interface DepositProps {
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<
    React.SetStateAction<number | undefined | string>
  >;
}

const InstantIcon: React.FC = () => {
  return (
    <svg
      width="19"
      height="24"
      className="instant-icon"
      viewBox="0 0 19 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.0235 0.188477L0.328125 14.9998H7.33673L5.98115 23.8111L18.6766 8.9998H11.668L13.0235 0.188477Z"
        fill="white"
        fill-opacity="0.3"
      />
    </svg>
  );
};

const Deposit: React.FC<DepositProps> = ({ amountEther, setAmountEther }) => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { pendingTransactions } = useTransaction();
  const { isThirdpartyBridgeModalOpen, setIsThirdpartyBridgeModalOpen } =
    useThirdpartyBridgeModalContext();
  const { evmWallet, solWallet } = useWallets();

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
          {!isModalOpen && <LrtPopup />}

          <div
            className="header-tabs"
            style={{
              marginRight: activeTab === Tabs.Activity ? "12px" : "0px",
            }}
          >
            <div
              className={classNames(
                "header-tab",
                activeTab === Tabs.Deposit ? "active" : "inactive"
              )}
              style={{ width: "100%" }}
              onClick={() => setActiveTab(Tabs.Deposit)}
            >
              Bridge
            </div>
            <div
              className={classNames(
                "header-tab flex items-center justify-center gap-[6px]",
                activeTab === Tabs.Relay ? "active" : "inactive"
              )}
              style={{ width: "100%" }}
              onClick={() => {
                setActiveTab(Tabs.Relay);
              }}
            >
              <InstantIcon />
              Instant
            </div>
            {evmWallet && (
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
