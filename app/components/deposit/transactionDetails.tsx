import "./transaction-details.css"
import { useContext, useEffect, useState, useRef } from "react";
import { Cross, Arrow } from "../icons"
import { TransactionIcon } from "../icons";
import { timeAgo } from "@/lib/activityUtils"
import { ethers } from 'ethers';
import { EthereumDataContext } from "@/app/context"
import { getNonce, getEclipseTransaction, checkDepositWithPDA } from "@/lib/activityUtils"
import { mainnet } from 'viem/chains'
import { createWalletClient, custom, WalletClient } from 'viem'

interface TransactionDetailsProps {
  closeModal: () => void; 
  tx: any;
}

const walletClient: WalletClient | null = typeof window !== 'undefined' && window.ethereum
  ? createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum),
    })
  : null;

const calculateFee = (gPrice: string, gUsed: string) => {
  const gasPriceBN = ethers.BigNumber.from(gPrice); 
  const gasUsedBN = ethers.BigNumber.from(gUsed);   
  const gasFee = gasPriceBN.mul(gasUsedBN);
  return ethers.utils.formatEther(gasFee);
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ closeModal, tx }) => {
  const [gasPrice, ethPrice] = useContext(EthereumDataContext) ?? [0, 0];
  const [eclipseTx, setEclipseTx] = useState<any>(null);
  const [depositProof, setDepositProof] = useState<any>(null);
  
  const ethAmount = tx && Number(ethers.utils.formatEther(tx.value));
  const totalFee = tx && calculateFee(tx.gasPrice, tx.gasUsed);
  const depositStatus = depositProof ? "completed" : "loading"; 
  const ethTxStatus   = tx ? "completed" : "loading"
  
  useEffect(() => {
    const fetchEclipseTx = async () => {
      if (!tx) return;
      console.log(tx, "tx")
      const pda = tx && await getNonce(walletClient, tx.hash);
      const eclTx = pda && await getEclipseTransaction(pda);
      const pdaData = eclTx && await checkDepositWithPDA(pda);

      console.log(tx, "tx")
      console.log(pda, "pda")
      console.log(eclTx, "eclTx")
      console.log(pdaData, "pdaData")
      console.log(eclipseTx, "eclipseTx")
      setDepositProof(pdaData);
      eclTx && setEclipseTx(eclTx[0]);
      if (!pdaData) setTimeout(() => fetchEclipseTx(), 2500) 
        // else if (!eclTx) setTimeout(() => fetchEclipseTx(), 2500) 
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
            <div className="white-text" style={{ fontSize: "16px" }}>1. Confirming transaction</div>
            { tx && <div className="gray-text"><a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank">View Txn</a></div> }
          </div>
          <div className={`flex flex-row items-center gap-1 ${ethTxStatus}-item status-item`}>
              <TransactionIcon iconType={ethTxStatus} className="tx-done-icon" /> 
              <span>{ ethTxStatus === "completed" ? "Done"  : "Continue in your wallet" }</span>
          </div>
        </div>


        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className={tx ? "white-text" : "gray-text"}>2. Depositing</div>
          </div>
          { tx && <div className={`flex flex-row items-center gap-1 ${depositStatus}-item status-item`}>
              <TransactionIcon iconType={depositStatus} className="tx-done-icon" /> 
              <span>{ depositStatus === "completed" ? "Done"  : "Processing" }</span>
          </div>}
        </div>


        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className={tx ? "white-text" : "gray-text"}>3. Receive on Eclipse</div>
            <div className="gray-text">
            { eclipseTx && <a href={`https://explorer.eclipse.xyz/tx/${eclipseTx.signature}`} target="_blank">View Txn</a> }
            </div>
          </div>
          { tx && <div className={`flex flex-row items-center gap-1 ${depositStatus}-item status-item`}>
              <TransactionIcon iconType={depositStatus} className="tx-done-icon" /> 
              <span>{ depositStatus === "completed" ? "Done"  : "Processing" }</span>
            </div>
          }
        </div>
      </div>
        { tx &&
        <div className="flex w-full flex-col" style={{marginTop: "30px", gap: "12px", padding: "0 10px"}}>
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
        </div>}

        { !tx && <div className="flex w-full items-center justify-center modal-info"> You may close this window anytime</div> }
        <button onClick={closeModal} className="done-button">Done</button>
    </div>
  )
};
