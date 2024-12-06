import { EthereumDataContext } from "@/app/context";
import { ethers } from "ethers";
import Image from "next/image";
import { useContext } from "react";
import { Arrow, Cross, TransactionIcon } from "../../components/icons";
import "./transaction-details.css";
import { tethEvmTokenAddress, tokenOptions } from "../constants/tokens";
import { StepStatus } from "../types";

export interface Step {
  title: string;
  status: StepStatus | string;
  link?: string;
}

interface TransactionDetailsProps {
  fromDeposit: boolean;
  closeModal: () => void;
  tx: any;
  steps: Step[];
  depositAmountAsBigInt: bigint;
  depositAssetLabel: string | undefined;
  depositAssetIcon: string | undefined;
  action: "Mint" | "Redeem";
}

export const MintTransactionDetails: React.FC<TransactionDetailsProps> = ({
  fromDeposit,
  closeModal,
  tx,
  steps,
  depositAmountAsBigInt,
  depositAssetLabel,
  depositAssetIcon,
  action,
}) => {
  const [_, ethPrice] = useContext(EthereumDataContext) ?? [0, 0];

  const depositAmount = Number(ethers.utils.formatEther(depositAmountAsBigInt));

  return (
    <div className="transaction-details-modal flex flex-col items-center">
      <div className="transaction-details-header flex flex-row items-center justify-between">
        <div></div>
        <span>{action}</span>
        <div onClick={closeModal}>
          <Cross crossClassName="modal-cross" />
        </div>
      </div>

      <div className="logo-header flex flex-row items-center">
        <Image
          src="/eth.png"
          alt="Ethereum"
          width={55}
          height={55}
          style={{
            objectFit: "cover",
            border: "7px solid rgba(0, 0, 0, 0.2)",
            outline: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "100%",
          }}
        />
        <Arrow />
        <Image
          src="/eclipse.png"
          alt="Eclipse"
          width={55}
          height={55}
          style={{
            objectFit: "cover",
            border: "7px solid rgba(0, 0, 0, 0.2)",
            outline: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "100%",
          }}
        />
      </div>

      <div className="status-panel">
        {steps.map((step, index) => (
          <div key={index} className="panel-elem flex flex-row items-center justify-between">
            <div className="left-side flex flex-row items-center">
              <div
                className={step.status === StepStatus.NOT_STARTED ? "gray-text" : "white-text"}
                style={{ fontSize: "16px" }}
              >
                {step.title}
              </div>
              {step.link && tx && (
                <div className="gray-text">
                  <a href={step.link} target="_blank">
                    View Txn
                  </a>
                </div>
              )}
            </div>
            {step.status !== StepStatus.NOT_STARTED && (
              <div className={`flex flex-row items-center gap-1 ${step.status}-item status-item`}>
                <TransactionIcon
                  iconType={step.status === StepStatus.AWAITING_SIGNATURE ? StepStatus.LOADING : step.status}
                  className="tx-done-icon"
                />
                <span>
                  {step.status === StepStatus.COMPLETED
                    ? "Done"
                    : step.status === StepStatus.FAILED
                    ? "Failed"
                    : step.status === StepStatus.AWAITING_SIGNATURE
                    ? "Awaiting signature"
                    : step.status === StepStatus.LOADING
                    ? "Processing"
                    : step.status === StepStatus.CANCELLED
                    ? "Cancelled"
                    : "Processing"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col" style={{ marginTop: "30px", gap: "12px", padding: "0 10px" }}>
        <div className="flex flex-row justify-between items-center">
          <span className="info-name">{action} Amount</span>
          <div className="flex flex-row gap-2">
            <span className="gray-text">{ethPrice && (depositAmount * ethPrice).toFixed(2)}</span>
            <span className="green-text">
              {depositAmount < 0.001 ? "< 0.001" : depositAmount.toFixed(3)} {depositAssetLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center">
          <span className="info-name">Asset</span>
          <div className="flex flex-row gap-2 items-center">
            {depositAssetIcon && (
              <Image
                src={depositAssetIcon}
                alt="Token Icon"
                width={16}
                height={16}
                style={{
                  objectFit: "cover",
                }}
              />
            )}
            <span className="green-text">{depositAssetLabel}</span>
          </div>
        </div>
      </div>

      {fromDeposit && (
        <div className="flex w-full items-center justify-center modal-info">You may close this window anytime</div>
      )}
      <button onClick={closeModal} className="done-button">
        Done
      </button>
    </div>
  );
};
