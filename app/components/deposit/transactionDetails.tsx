import "./transaction-details.css"
import { useContext } from "react";
import { Cross, Arrow } from "../icons"
import { TransactionIcon } from "../icons";
import { timeAgo } from "@/lib/activityUtils"
import { ethers } from 'ethers';
import { EthereumDataContext } from "@/app/context"

interface TransactionDetailsProps {
  closeModal: () => void; 
  tx: any;
}

const calculateFee = (gPrice: string, gUsed: string) => {
  const gasPriceBN = ethers.BigNumber.from(gPrice); 
  const gasUsedBN = ethers.BigNumber.from(gUsed);   
  const gasFee = gasPriceBN.mul(gasUsedBN);
  return ethers.utils.formatEther(gasFee);
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ closeModal, tx }) => {
  const [gasPrice, ethPrice] = useContext(EthereumDataContext) ?? [0, 0];
  const ethAmount = Number(ethers.utils.formatEther(tx.value));
  const totalFee = calculateFee(tx.gasPrice, tx.gasUsed);


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
            <img src="eth.png" alt="Ethereum" style={{
              objectFit: "cover", 
              height: "55px", 
              width: "55px", 
              border: "7px solid rgba(0, 0, 0, 0.2)", 
              outline: "1px solid rgba(255, 255, 255, 0.1)", 
              borderRadius: "100%"
             }} />
             <Arrow />
            <img src="eclipse.png" alt="Eclipse" style={{
              objectFit: "cover", 
              height: "55px", 
              width: "55px", 
              border: "7px solid rgba(0, 0, 0, 0.2)", 
              outline: "1px solid rgba(255, 255, 255, 0.1)", 
              borderRadius: "100%"
             }} />
      </div>
      <div className="status-panel">
        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className="white-text">1. Confirming transaction</div>
            <div className="gray-text"><a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank">View Txn</a></div>
          </div>
          <div className="flex flex-row items-center gap-1 done-item">
              <TransactionIcon iconType="completed" className="tx-done-icon" /> 
              <span>Done</span>
          </div>
        </div>


        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className="white-text">2. Depositing</div>
          </div>
          <div className="flex flex-row items-center gap-1 done-item">
              <TransactionIcon iconType="completed" className="tx-done-icon" /> 
              <span>Done</span>
          </div>
        </div>


        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className="white-text">3. Receive on Eclipse</div>
          </div>
          <div className="flex flex-row items-center gap-1 done-item">
              <TransactionIcon iconType="completed" className="tx-done-icon" /> 
              <span>Done</span>
          </div>
        </div>


        <div className="flex flex-col" style={{marginTop: "30px", gap: "12px", padding: "0 10px"}}>
          <div className="flex flex-row justify-between items-center">
            <span className="info-name">Deposit Amount</span>
            <div className="flex flex-row gap-2">
              <span className="gray-text">${ethPrice && (ethAmount * ethPrice).toFixed(2)}</span>
              <span className="green-text">{ethAmount.toFixed(3)} ETH</span>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center">
            <span className="info-name">Transaction Fee</span>
            <div className="flex flex-row gap-2">
              <span className="gray-text">${ethPrice && (Number(totalFee) * ethPrice).toFixed(3)}</span>
              <span className="green-text">{Number(totalFee).toFixed(4)} ETH</span>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center">
            <span className="info-name">Asset</span>
            <div className="flex flex-row gap-2 items-center">
              <img src="eth.png" alt="Ethereum" style={{
                objectFit: "cover", 
                height: "16px", 
                width: "16px", 
              }} />
              <span className="green-text">Ethereum</span>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center">
            <span className="info-name">Age</span>
            <div className="flex flex-row gap-2">
              <span className="green-text">{timeAgo(tx.timeStamp)}</span>
            </div>
          </div>
        </div>

        <button onClick={closeModal} className="done-button">Done</button>
      </div>
    </div>
  )
};

