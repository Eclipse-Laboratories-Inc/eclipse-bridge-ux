import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Arrow } from "@/app/components/icons";
import { TransactionIcon, ActivityBoxIcon, Activity } from "../icons";
import { timeAgo, timeLeft } from "@/lib/activityUtils";
import Skeleton from "react-loading-skeleton";
import { TransactionDetails } from "../TransactionDetails";
import { useTransaction } from "../TransactionPool";
import { Tabs } from "./index";
import "./activity.css";
import { useWallets } from "@/app/hooks/useWallets";
import { useNetwork } from "@/app/contexts/NetworkContext";
import { WithdrawDetails } from "../WithdrawDetails";
import { InstantTransactionDetails } from "./InstantTransactionDetails";
import { useRequests, useRelayChains } from "@relayprotocol/relay-kit-hooks";
import { relayApiUrl, summarizeRelayRequest } from "@/lib/relay";

export const ActivityItem = ({
  openModalEvent,
  tokenIcon,
  fromChain,
  toChain,
  transactionType,
  transactionTime,
  transactionStatusPill,
  transactionAmount,
  isInstant,
}: {
  openModalEvent: () => void;
  tokenIcon: string;
  fromChain: string;
  toChain: string;
  transactionType: string;
  transactionTime: string;
  transactionStatusPill: React.ReactElement;
  transactionAmount: string;
  isInstant?: boolean;
}) => {
  return (
    <div
      className="deposit-transaction flex flex-row items-center"
      onClick={openModalEvent}
    >
      <div className="flex w-[53px] h-[53px] relative ml-[5px] mr-[16px]">
        <img
          src={tokenIcon ? tokenIcon : "unknown-token.png"}
          alt="Ethereum"
          className="object-cover h-[53px] w-[53px] rounded-[50%]"
        />
        {isInstant && (
          <div
            className="w-[22px] h-[22px] border-[3px] border-[#0D0D0D] rounded-[50%] absolute"
            style={{
              backgroundImage: "url('instant-swap-icon.png')",
              left: "-4.5px",
              top: "-4.5px",
              backgroundSize: "cover",
            }}
          ></div>
        )}
      </div>
      <div className="flex flex-col justify-center w-[85%] gap-[4px]">
        <div className="transaction-top flex justify-between">
          <div className="flex tx-age gap-[7px]">
            <span className="gray-in">{transactionType}</span>
            <span className="gray-in">•</span>
            <span className="gray-in">{transactionTime}</span>
          </div>
          {transactionStatusPill}
        </div>
        <div className="transaction-bottom flex justify-between">
          <div className="flex flex-row items-center eth-to-ecl gap-[14px]">
            <span className="white-in">{fromChain}</span>
            <Arrow />
            <span className="white-in">{toChain}</span>
          </div>
          <span className="white-in">{transactionAmount}</span>
        </div>
      </div>
    </div>
  );
};

function getWithdrawalActivityPill(status: String, timeLeft?: String) {
  if (status === "Pending") {
    return (
      <div className="flex items-center bg-[#A1FEA0] rounded-[13px] py-[3px] px-[8px] text-black text-[12px]">
        Claim Now
      </div>
    );
  }

  if (status === "Processing") {
    return (
      <div className="flex flex-row items-center text-[12px] rounded-[13px] bg-[#ffffff0d] p-[3px] pr-[8px] pl-[4px] gap-[6px]">
        <Activity activityClassName="w-[14px]" />
        <span className="text-[#ffffff4d]">Processing</span>
        <span className="text-[#A1FEA0]">~ {timeLeft}</span>
      </div>
    );
  }

  return (
    <div
      className="
          flex flex-row rounded-[13px] 
          px-[8px] py-[3px] bg-[#a1fea00d]
          text-[12px] text-[#A1FEA0]
          items-center gap-[6px]
    "
    >
      <TransactionIcon iconType="completed" className="w-[14px]" />
      <span>Completed</span>
    </div>
  );
}

export const ActivityContent = ({
  setActiveTab,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<Tabs>>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInstantTxOpen, setIsInstantTxOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] =
    useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const { transactions, deposits, withdrawals, withdrawTransactions } =
    useTransaction();
  const { evmWallet } = useWallets();
  const { fraudWindowSeconds } = useNetwork();

  // /requests/v3 has a tight rate limit shared by every visitor (via our proxy
  // key), so skip it until a wallet is connected and don't refetch on focus.
  const {
    data: relayTransactions,
    isError: isRelayError,
    isFetching: isRelayFetching,
    refetch: refetchRelay,
  } = useRequests(
    evmWallet ? { user: evmWallet.address } : false,
    relayApiUrl(),
    { staleTime: 60_000, refetchOnWindowFocus: false },
  );
  const { chains } = useRelayChains(relayApiUrl());

  // Activity needs a wallet; without one, go back to Deposit. In an effect,
  // not during render: setting Deposit's state while rendering this component
  // is what React warned about ("Cannot update a component while rendering a
  // different component").
  useEffect(() => {
    if (!evmWallet) setActiveTab(Tabs.Deposit);
  }, [evmWallet, setActiveTab]);

  if (!evmWallet) {
    return <></>;
  }

  // Initiation time of a withdrawal: the Eclipse tx's blockTime once that
  // lookup finishes, else start_time (when it becomes claimable) minus the
  // fraud window. Without the fallback it sorts as 0 (the bottom) until the
  // lookup finishes, and stays there forever if the lookup fails.
  // The fallback runs late by the relay delay before the fraud window starts:
  // seconds on testnet, ~10h seen on mainnet. It's the only source once the
  // RPC has pruned the tx (it keeps ~6 days; the receipt account has no
  // timestamp).
  const withdrawalTimestamp = (w: any): number =>
    withdrawTransactions.get(w[0].message.withdraw_id)?.transaction?.blockTime ||
    parseInt(w[0].start_time, 16) - fraudWindowSeconds;

  const combinedTransactions = [
    ...(withdrawals || []).map((w) => ({
      type: "withdrawal",
      data: w,
      timestamp: withdrawalTimestamp(w),
    })),
    ...(deposits || []).map((tx) => ({
      type: "deposit",
      data: tx,
      timestamp: Number(tx.timeStamp),
    })),
    ...(relayTransactions || [])
      .filter((tx) => {
        const outTxsChainId = tx.data?.outTxs?.[0]?.chainId;
        const inTxsChainId = tx.data?.inTxs?.[0]?.chainId;
        return outTxsChainId === 9286185 || inTxsChainId === 9286185;
      })
      .map((tx) => ({
        type: "relay",
        data: tx,
        timestamp: Math.floor(
          new Date((tx.createdAt ?? new Date()).toString()).getTime() / 1000,
        ),
      })),
  ];
  combinedTransactions.sort((a, b) => {
    if (a.type === "withdrawal" && a.data[1] === "Pending") {
      if (b.type === "withdrawal" && b.data[1] === "Pending") {
        return b.timestamp - a.timestamp;
      }
      return -1;
    }

    if (b.type === "withdrawal" && b.data[1] === "Pending") {
      return 1;
    }

    return b.timestamp - a.timestamp;
  });

  return (
    <>
      <div
        className={
          isModalOpen || isWithdrawModalOpen || isInstantTxOpen
            ? "status-overlay active"
            : "status-overlay"
        }
      ></div>
      <div className="activity-container">
        {isRelayError && (
          <div className="flex flex-row items-center justify-between gap-2 text-sm font-medium text-[#ffffff4d]">
            <span>Couldn&apos;t load Instant transactions.</span>
            <button
              className="text-white disabled:opacity-50"
              disabled={isRelayFetching}
              onClick={() => refetchRelay()}
            >
              Retry
            </button>
          </div>
        )}
        {combinedTransactions &&
          combinedTransactions.map((activity, index) => {
            const relaySummary =
              activity.type === "relay"
                ? summarizeRelayRequest(activity.data)
                : undefined;
            const currencyIn = relaySummary?.currencyIn;
            const currencyOut = relaySummary?.currencyOut;
            if (currencyIn?.currency && currencyOut?.currency) {
              const sourceChain = chains?.find(
                (chain) => chain.id === currencyIn.currency?.chainId,
              );
              const targetChain = chains?.find(
                (chain) => chain.id === currencyOut.currency?.chainId,
              );

              const status =
                activity.data.status === "success" ? "completed" : "failed";
              const statusPill = (
                <div
                  className={`flex flex-row items-center status-div ${status}`}
                >
                  <TransactionIcon iconType={status} />
                  <span>{status}</span>
                </div>
              );
              return (
                <ActivityItem
                  openModalEvent={() => {
                    setCurrentTx(activity.data);
                    setIsInstantTxOpen(true);
                  }}
                  tokenIcon={currencyIn.currency.metadata?.logoURI ?? ""}
                  transactionType="Deposit"
                  fromChain={sourceChain?.name ?? ""}
                  toChain={targetChain?.name ?? ""}
                  transactionTime={timeAgo(activity.timestamp)}
                  transactionAmount={`${(Number(currencyIn.amount) / 10 ** (currencyIn.currency.decimals ?? 18)).toFixed(4)} ${currencyIn.currency.symbol}`}
                  transactionStatusPill={statusPill}
                  isInstant={true}
                  key={activity.data.id}
                />
              );
            }

            if (activity.type === "withdrawal") {
              const withdraw_message = activity.data[0].message;
              const amount = ethers.utils.formatEther(
                withdraw_message.amount_wei,
              );
              const claimTime = timeLeft(
                parseInt(activity.data[0].start_time, 16) * 1000,
              );

              return (
                <ActivityItem
                  openModalEvent={() => {
                    setCurrentTx(activity.data);
                    setIsWithdrawModalOpen(true);
                  }}
                  tokenIcon="eth.png"
                  transactionType="Withdraw"
                  fromChain="Eclipse"
                  toChain="Ethereum"
                  transactionTime={timeAgo(activity.timestamp)}
                  transactionAmount={`${parseFloat(amount).toFixed(3)} ETH`}
                  transactionStatusPill={getWithdrawalActivityPill(
                    activity.data[1],
                    claimTime,
                  )}
                  key={withdraw_message.withdraw_id}
                />
              );
            }

            if (activity.type === "deposit") {
              const transaction = activity.data;
              const pdaData = transactions.get(transaction.hash)?.pdaData;

              const status = Number(transaction.isError)
                ? "failed"
                : pdaData
                  ? "completed"
                  : pdaData === undefined
                    ? null
                    : "loading";

              const statusPill = (
                <div
                  className={`flex flex-row items-center status-div ${status}`}
                >
                  {status ? (
                    <>
                      <TransactionIcon iconType={status} />
                      <span>
                        {status === "loading" ? "depositing" : status}
                      </span>
                    </>
                  ) : (
                    <Skeleton height={15} width={91} />
                  )}
                </div>
              );
              return (
                <ActivityItem
                  openModalEvent={() => {
                    setIsModalOpen(true);
                    setCurrentTx(transaction);
                  }}
                  tokenIcon="eth.png"
                  transactionType="Deposit"
                  fromChain="Ethereum"
                  toChain="Eclipse"
                  transactionTime={timeAgo(Number(transaction.timeStamp))}
                  transactionAmount={`${Number(ethers.utils.formatEther(transaction.value)).toFixed(3)} ETH`}
                  transactionStatusPill={statusPill}
                  key={transaction.hash}
                />
              );
            }
          })}

        {!evmWallet ? (
          <span>Connect your evm wallet first.</span>
        ) : (
          !deposits?.length &&
          !withdrawals?.length && (
            <div className="flex flex-col items-center justify-center gap-[21px] h-[90%]">
              <ActivityBoxIcon activityBoxClassName="" />
              <span className="text-lg text-[#ffffff4d] font-medium w-[266px]">
                You don’t have any transactions to show
              </span>
            </div>
          )
        )}
      </div>
      {isModalOpen && (
        <TransactionDetails
          from=""
          tx={currentTx}
          closeModal={() => setTimeout(() => setIsModalOpen(false), 100)}
        />
      )}
      {isWithdrawModalOpen && (
        <WithdrawDetails
          from="withdraw"
          tx={currentTx}
          ethAmount={0}
          closeModal={() =>
            setTimeout(() => setIsWithdrawModalOpen(false), 100)
          }
        />
      )}
      {isInstantTxOpen && (
        <InstantTransactionDetails
          activity={currentTx}
          closeModal={() => setTimeout(() => setIsInstantTxOpen(false), 100)}
        />
      )}
    </>
  );
};
