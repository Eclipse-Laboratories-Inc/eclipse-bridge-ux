import "./transaction-details.css"
import React, { useContext, useEffect, useState } from "react";
import { Cross, Arrow, TransactionIcon } from "../icons"
import { timeAgo, getNonce, getEclipseTransaction, checkDepositWithPDA } from "@/lib/activityUtils"
import { ethers } from 'ethers';
import { EthereumDataContext } from "@/app/context"
import { mainnet } from 'viem/chains'
import { createWalletClient, custom, WalletClient } from 'viem'

interface TransactionDetailsProps {
  closeModal: () => void; 
  tx: Transaction | null;
}

interface Transaction {
  hash: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timeStamp: number;
}

interface EclipseTransaction {
  signature: string;
}

type TransactionStatus = "completed" | "loading" | "failed";

const walletClient: WalletClient | null = typeof window !== 'undefined' && window.ethereum
  ? createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum),
    })
  : null;

const calculateFee = (gPrice: string, gUsed: string): string => {
  const gasPriceBN = ethers.BigNumber.from(gPrice);
  const gasUsedBN = ethers.BigNumber.from(gUsed);
  const gasFee = gasPriceBN.mul(gasUsedBN);
  return ethers.utils.formatEther(gasFee);
}

interface StatusPanelProps {
  tx: Transaction | null;
  eclipseTx: EclipseTransaction | null;
  ethTxStatus: TransactionStatus;
  depositStatus: TransactionStatus;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ tx, eclipseTx, ethTxStatus, depositStatus }) => (
  <div className="status-panel">
    <StatusPanelItem 
      step={1}
      title="Confirming transaction"
      status={ethTxStatus}
      link={tx ? `https://etherscan.io/tx/${tx.hash}` : undefined}
    />
    <StatusPanelItem 
      step={2}
      title="Depositing"
      status={depositStatus}
      disabled={!tx}
    />
    <StatusPanelItem 
      step={3}
      title="Receive on Eclipse"
      status={depositStatus}
      link={eclipseTx ? `https://explorer.eclipse.xyz/tx/${eclipseTx.signature}` : undefined}
      disabled={!tx}
    />
  </div>
);

interface StatusPanelItemProps {
  step: number;
  title: string;
  status: TransactionStatus;
  link?: string;
  disabled?: boolean;
}

const StatusPanelItem: React.FC<StatusPanelItemProps> = ({ step, title, status, link, disabled }) => (
  <div className="panel-elem flex flex-row items-center justify-between">
    <div className="left-side flex flex-row">
      <div className={disabled ? "gray-text" : "white-text"}>{step}. {title}</div>
      {link && <div className="gray-text"><a href={link} target="_blank" rel="noopener noreferrer">View Txn</a></div>}
    </div>
    {!disabled && (
      <div className={`flex flex-row items-center gap-1 ${status}-item status-item`}>
        <TransactionIcon iconType={status} className="tx-done-icon" />
        <span>{status === "completed" ? "Done" : status === "loading" ? "Processing" : "Continue in your wallet"}</span>
      </div>
    )}
  </div>
);

interface TransactionInfoProps {
  ethAmount: number;
  ethPrice: any;
  totalFee: string;
  tx: Transaction;
}

const TransactionInfo: React.FC<TransactionInfoProps> = ({ ethAmount, ethPrice, totalFee, tx }) => (
  <div className="flex w-full flex-col" style={{marginTop: "30px", gap: "12px", padding: "0 10px"}}>
    <InfoItem label="Deposit Amount" value={ethAmount} price={ethPrice} />
    <InfoItem label="Transaction Fee" value={Number(totalFee)} price={ethPrice} />
    <InfoItem label="Asset" value="Ethereum" icon="eth.png" />
    <InfoItem label="Age" value={timeAgo(tx.timeStamp)} />
  </div>
);

interface InfoItemProps {
  label: string;
  value: number | string;
  price?: number;
  icon?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, price, icon }) => (
  <div className="flex flex-row justify-between items-center">
    <span className="info-name">{label}</span>
    <div className="flex flex-row gap-2 items-center">
      {icon && <img src={icon} alt={value.toString()} style={{ objectFit: "cover", height: "16px", width: "16px" }} />}
      {price && <span className="gray-text">${(typeof value === 'number' ? value * price : 0).toFixed(2)}</span>}
      <span className="green-text">
        {typeof value === 'number' ? value.toFixed(icon ? 3 : 4) : value}
        {!icon && typeof value === 'number' && " ETH"}
      </span>
    </div>
  </div>
);

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ closeModal, tx }) => {
  const [gasPrice, ethPrice] = useContext(EthereumDataContext) ?? [0, 0];
  const [eclipseTx, setEclipseTx] = useState<EclipseTransaction | null>(null);
  const [depositProof, setDepositProof] = useState<any>(null);
  
  const ethAmount = tx ? Number(ethers.utils.formatEther(tx.value)) : 0;
  const totalFee = tx ? calculateFee(tx.gasPrice, tx.gasUsed) : "0";
  const depositStatus: TransactionStatus = depositProof ? "completed" : "loading"; 
  const ethTxStatus: TransactionStatus = tx ? "completed" : "loading";
  
  useEffect(() => {
    const fetchEclipseTx = async () => {
      if (!tx || !walletClient) return;
      try {
        const pda = await getNonce(walletClient, tx.hash);
        if (pda) {
          const eclTx = await getEclipseTransaction(pda);
          const pdaData = await checkDepositWithPDA(pda);
          setDepositProof(pdaData);
          if (eclTx && eclTx.length > 0) setEclipseTx(eclTx[0]);
          if (!pdaData) setTimeout(fetchEclipseTx, 2500);
        }
      } catch (error) {
        console.error("Error fetching Eclipse transaction:", error);
      }
    }

    fetchEclipseTx();
  }, [tx])

  return (
    <div className="transaction-details-modal flex flex-col items-center">
      <div className="transaction-details-header flex flex-row items-center justify-between">
        <div></div>
        <span>Deposit</span>
        <div onClick={closeModal}>
          <Cross crossClassName="modal-cross" />
        </div>
      </div>

      <div className="logo-header flex flex-row items-center">
        <img src="eth.png" alt="Ethereum" className="chain-logo" />
        <Arrow />
        <img src="eclipse.png" alt="Eclipse" className="chain-logo" />
      </div>

      <StatusPanel 
        tx={tx} 
        eclipseTx={eclipseTx} 
        ethTxStatus={ethTxStatus} 
        depositStatus={depositStatus}
      />

      {tx ? (
        <TransactionInfo 
          ethAmount={ethAmount} 
          ethPrice={ethPrice} 
          totalFee={totalFee} 
          tx={tx} 
        />
      ) : (
        <div className="flex w-full items-center justify-center modal-info">
          You may close this window anytime
        </div>
      )}

      <button onClick={closeModal} className="done-button">Done</button>
    </div>
  )
};
