import { ActivityBoxIcon, Arrow, TransactionIcon } from "@/app/components/icons";
import { useWallets } from "@/app/hooks/useWallets";
import { timeAgo } from "@/lib/activityUtils";
import { ethers } from "ethers";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "../../components/Deposit/activity.css";
import { tethEvmTokenAddress, tokenOptions } from "../constants/tokens";
import { useTransactions } from "../hooks/useTransactions";
import { MintTransactionDetails } from "./MintTransactionDetails";
import { SelectOption } from "./EcSelect";
import { NucleusTransaction, StepStatus } from "../types";
import Loading from "@/app/components/icons/loading";

interface NucleusActivityContentProps {
  transactions: NucleusTransaction[];
  isLoading: boolean;
}

export const NucleusActivityContent = ({ transactions, isLoading }: NucleusActivityContentProps) => {
  // Constants
  const eclipseNucleusStatusMap: Record<string, string> = {
    pending: "loading",
    fulfilled: "completed",
    cancelled: "cancelled",
    expired: "failed",
  };

  // Hooks
  const { evmWallet } = useWallets();

  // State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<NucleusTransaction | null>(null);

  // Iterates over available token options along with tETH and returns the token that matches the address
  // Memoized callback because it iterates over an array
  const findTokenByAddress = useCallback((address: string) => {
    return tokenOptions
      .concat({ value: tethEvmTokenAddress, label: "tETH", imageSrc: "/token-teth.svg" })
      .find((token) => token.value === address);
  }, []);

  const offerTokenOption = currentTx?.offerToken ? findTokenByAddress(currentTx?.offerToken) : null;

  // Memoized because it returns a new array
  const steps = useMemo(() => {
    let swapStatus = StepStatus.LOADING;
    if (currentTx?.status === "fulfilled") {
      swapStatus = StepStatus.COMPLETED;
    }
    if (currentTx?.status === "cancelled") {
      swapStatus = StepStatus.CANCELLED;
    }
    if (currentTx?.status === "expired") {
      swapStatus = StepStatus.FAILED;
    }

    let otherStatuses = StepStatus.COMPLETED;
    if (currentTx?.status === "cancelled" || currentTx?.status === "expired") {
      otherStatuses = StepStatus.FAILED;
    }

    return [
      {
        title: "1. Bridging tETH to Ethereum",
        status: otherStatuses,
      },
      {
        title: "2. Approving tETH swap",
        status: otherStatuses,
      },
      {
        title: `3. Requesting Withdraw`,
        status: swapStatus,
        link: `https://etherscan.io/tx/${currentTx?.createdTransactionHash}`,
      },
    ];
  }, [currentTx?.createdTransactionHash, currentTx?.status]);

  return (
    <>
      <div className={isModalOpen ? "status-overlay active" : "status-overlay"}></div>
      <div className="activity-container">
        {isLoading ? (
          <Loading loadingClassName="loading-spinner" style={{ margin: "auto", transform: "scale(4)" }} />
        ) : (
          evmWallet &&
          transactions &&
          transactions.map((tx, index) => {
            const offerTokenOption = findTokenByAddress(tx.offerToken);
            const wantTokenOption = findTokenByAddress(tx.wantToken);
            return (
              <div
                key={index}
                className="deposit-transaction flex flex-row items-center"
                onClick={() => {
                  setIsModalOpen(true);
                  setCurrentTx(tx);
                }}
              >
                <Image
                  src={offerTokenOption?.imageSrc ?? ""}
                  alt={offerTokenOption?.label ?? ""}
                  style={{ objectFit: "cover", height: "53px", width: "53px", marginLeft: "5px", marginRight: "16px" }}
                  width={53}
                  height={53}
                />
                <div className="flex flex-col justify-center" style={{ width: "85%" }}>
                  <div className="transaction-top flex justify-between">
                    <div className="flex tx-age" style={{ gap: "7px" }}>
                      <span className="gray-in">{tx.offerToken === tethEvmTokenAddress ? "Redeem" : "Mint"}</span>
                      <span className="gray-in">•</span>
                      <span className="gray-in">{timeAgo(Number(tx.createdTimestamp))}</span>
                    </div>
                    <div className={`flex flex-row items-center status-div ${tx.status}`}>
                      {tx.status ? (
                        <>
                          <TransactionIcon iconType={eclipseNucleusStatusMap[tx.status]} />
                          <span>{tx.status === "pending" ? "Processing" : tx.status}</span>
                        </>
                      ) : (
                        <Skeleton height={15} width={91} />
                      )}
                    </div>
                  </div>
                  <div className="transaction-bottom flex justify-between">
                    <div className="flex flex-row items-center eth-to-ecl" style={{ gap: "14px" }}>
                      <span className="white-in preserve-casing">{offerTokenOption?.label}</span>
                      <Arrow />
                      <span className="white-in preserve-casing">{wantTokenOption?.label}</span>
                    </div>
                    {/* <span className="white-in">{Number(ethers.utils.formatEther(tx.amount)).toFixed(3)} ETH</span> */}
                    <span className="white-in">
                      {parseFloat(ethers.utils.formatEther(tx.amount)) > 0.001
                        ? parseFloat(ethers.utils.formatEther(tx.amount)).toFixed(3)
                        : "< 0.001"}{" "}
                      ETH
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {!evmWallet ? (
          <span>Connect your evm wallet first.</span>
        ) : (
          !isLoading &&
          transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center" style={{ height: "90%", gap: "21px" }}>
              <ActivityBoxIcon activityBoxClassName="" />
              <span style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.3)", fontWeight: "500", width: "266px" }}>
                You don’t have any transactions to show
              </span>
            </div>
          )
        )}
      </div>
      {isModalOpen && (
        <MintTransactionDetails
          fromDeposit={false}
          tx={currentTx}
          closeModal={() => setTimeout(() => setIsModalOpen(false), 100)}
          steps={steps}
          depositAmountAsBigInt={BigInt(0)}
          depositAssetLabel={offerTokenOption?.label}
          depositAssetIcon={offerTokenOption?.imageSrc}
          action={currentTx?.offerToken === tethEvmTokenAddress ? "Redeem" : "Mint"}
        />
      )}
    </>
  );
};
