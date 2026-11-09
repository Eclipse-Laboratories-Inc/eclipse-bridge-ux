"use client";

import "./styles.css";
import React, { useEffect } from "react";
import AirdropPopup from "./AirdropPopup";
import "./styles.css";
import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import classNames from "classnames";
import { Activity, Loading, InstantIcon } from "../icons";
import "./styles.css";
import { DepositContent } from "./DepositContent";
import { ReclaimContent } from "./ReclaimContent";
import { ActivityContent } from "./ActivityContent";
import { RelaySwapWidget } from "@/app/components/Deposit/RelaySwapWidget";
import { useTransaction } from "../TransactionPool";
import { ThirdpartyBridgesPill } from "../ThirdpartyBridgeModal";
import { useWallets } from "@/app/hooks/useWallets";
import { useThirdpartyBridgeModalContext } from "../ThirdpartyBridgeModal/ThirdpartyBridgeModalContext";

export enum Tabs {
  Deposit = "deposit",
  Relay = "instant",
  Reclaim = "reclaim",
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

  // Reflect the tab in the URL without a router navigation. router.push
  // refetched the page's RSC payload on every tab change (and on mount),
  // which re-preloaded the page CSS and made Chrome warn "preloaded but not
  // used". Replace, not push: the tab is only read from the URL on mount, so
  // extra history entries made Back change the URL but not the tab.
  useEffect(() => {
    const url = `${pathname}?target=${activeTab}`;
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [activeTab, pathname]);

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
            <div
              className={classNames(
                "header-tab w-full",
                activeTab === Tabs.Reclaim ? "active" : "inactive",
              )}
              onClick={() => setActiveTab(Tabs.Reclaim)}
            >
              Reclaim
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
          {activeTab === Tabs.Reclaim && <ReclaimContent />}
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
