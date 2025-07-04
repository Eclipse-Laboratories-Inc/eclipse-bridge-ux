
"use client";

import "./styles.css";
import React, { useEffect } from "react";
import AirdropPopup from "./AirdropPopup";
import "./styles.css";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import classNames from "classnames";
import { Activity, Loading, InstantIcon } from "../icons";
import "./styles.css";
import { DepositContent } from "./DepositContent";
import { ActivityContent } from "./ActivityContent";
import { RelaySwapWidget } from "@/app/components/Deposit/RelaySwapWidget";
import { useTransaction } from "../TransactionPool";
import { ThirdpartyBridgesPill } from "../ThirdpartyBridgeModal";
import { useWallets } from "@/app/hooks/useWallets";
import { useThirdpartyBridgeModalContext } from "../ThirdpartyBridgeModal/ThirdpartyBridgeModalContext";

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
  const urlParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Deposit);
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
    router.push(pathname + `?target=${activeTab}`);
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
            <>
              {/* Maintenance Banner */}
              <div className="flex w-full items-center justify-center
                py-[12px] px-[16px]
                rounded-[10px]
                bg-[#ff6b6b0d] gap-[12px] text-[14px] font-medium
                text-[#ff6b6b] mb-[20px]
                border-[1px] border-[#ff6b6b1a]">
                <span className="w-[16px] h-[16px] border-[2px] rounded-[50%] border-[#ff6b6b] flex items-center justify-center">
                  <span className="w-[6px] h-[6px] rounded-[50%] bg-[#ff6b6b]"></span>
                </span>
                <span>Bridge is under maintenance, will be back soon</span>
              </div>

              <DepositContent
                modalStuff={[isModalOpen, setIsModalOpen]}
                amountEther={amountEther}
                setAmountEther={setAmountEther}
                isMaintenanceMode={true}
              />
            </>
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
