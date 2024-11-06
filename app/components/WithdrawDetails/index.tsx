import "./transaction-details.css";
import { useContext, useEffect, useState } from "react";
import { Cross, Arrow, TransactionIcon } from "../icons";
import { timeAgo } from "@/lib/activityUtils";
import { ethers } from "ethers";
import { EthereumDataContext } from "@/app/context";
import { useTransaction } from "../TransactionPool";
import { useNetwork } from "@/app/contexts/NetworkContext"; 
import { withdrawEthereum } from "@/lib/withdrawUtils"
import { useWallets } from "@/app/hooks/useWallets";

interface TransactionDetailsProps {
  from: "deposit" | "withdraw" | "";
  closeModal: () => void;
  tx: any;
  ethStatus?: string;
  ethAmount: Number; 
}

enum TxStatus {
  Completed = "completed",
  Loading = "loading",
  Failed = "failed"
}

enum InitiateTxStates {
  InWallet = "Approve in wallet",
  Confirming = "Confirming",
  Done = "Done"
} 

enum WaitingPeriodState {
  Waiting = "Waiting",
  Ready = "Done"
}

// we will have 3 states
//
// 1 initiate transaction state
// 2 waiting period state
// 3 claim 
//
//

const calculateFee = (gasPrice: string, gasUsed: string) => {
  const gasPriceBN = ethers.BigNumber.from(gasPrice);
  const gasUsedBN = ethers.BigNumber.from(gasUsed);
  const gasFee = gasPriceBN.mul(gasUsedBN);
  return ethers.utils.formatEther(gasFee);
};

const TransactionDirection: React.FC<{from: string}> = ({ from }) => { 
  const chains = [
    { src: "eth.png", name: "Ethereum" },
    { src: "eclipse.png", name: "Eclipse" },
  ];
  from === "withdraw" && chains.reverse();
  const [fromChain, toChain] = chains;

  return (
    <div className="logo-header flex flex-row items-center">
      <img src={fromChain.src} alt={fromChain.name} className="chain-logo" />
      <Arrow />
      <img src={toChain.src} alt={toChain.name} className="chain-logo" />
    </div>
  )
}
 
const TxInfo: React.FC<{ name: string, grayText: string, greenText: string}> = ({ name, grayText, greenText}) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <span className="info-name">{ name }</span>
      <div className="flex flex-row gap-2">
        <span className="gray-text" > { grayText } </span>
        <span className="green-text"> { greenText } </span>
      </div>
    </div>
  );
} 


const CheckGreen: React.FC = () => {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 2.5C6.97715 2.5 2.5 6.97715 2.5 12.5C2.5 18.0228 6.97715 22.5 12.5 22.5C18.0228 22.5 22.5 18.0228 22.5 12.5C22.5 6.97715 18.0228 2.5 12.5 2.5ZM16.274 10.6333C16.6237 10.2058 16.5607 9.5758 16.1332 9.22607C15.7058 8.87635 15.0758 8.93935 14.726 9.36679L10.9258 14.0116L9.70711 12.7929C9.31658 12.4024 8.68342 12.4024 8.29289 12.7929C7.90237 13.1834 7.90237 13.8166 8.29289 14.2071L10.2929 16.2071C10.4927 16.4069 10.7676 16.5129 11.0498 16.4988C11.332 16.4847 11.595 16.3519 11.774 16.1333L16.274 10.6333Z" fill="#A1FEA0"/>
    </svg>
  );
}

export const WithdrawDetails: React.FC<TransactionDetailsProps> = ({
  from,
  closeModal,
  tx,
  ethStatus,
  ethAmount
}) => {
  const [_, ethPrice] = useContext(EthereumDataContext) ?? [0, 0];
  const { transactions, addTransactionListener } = useTransaction();
  const { evmExplorer, eclipseExplorer, relayerAddress, configAccount, eclipseRpc, bridgeProgram } = useNetwork();
  const { userWallets, evmWallet, solWallet } = useWallets();
  const [txHash, setTxHash] = useState<string | null>(null);

  const [initiateStatus, setInitiateStatus] = useState<InitiateTxStates>(InitiateTxStates.InWallet);
  const [waitingPeriodStatus, setWaitingPeriodStatus] = useState<WaitingPeriodState>(WaitingPeriodState.Waiting);

  const transaction = tx && transactions.get(tx.hash);

  const eclipseTx = transaction?.eclipseTxHash ?? null;
  const totalFee = 0.00000005;

  const depositStatus: TxStatus = transaction?.pdaData ? TxStatus.Completed : TxStatus.Loading;
  const ethTxStatus = tx 
      ? (tx.txreceipt_status === "0" ? TxStatus.Failed : TxStatus.Completed) 
      : TxStatus.Loading;

  useEffect(() => {
    tx && addTransactionListener(tx.hash, tx.txreceipt_status);
  }, [tx]);

  const handleInitiate = async () => {
    try {
       let _txHash = await withdrawEthereum(
        solWallet?.connector.getSigner(),
        evmWallet?.address || "",
        eclipseRpc,
        configAccount,
        relayerAddress,
        bridgeProgram 
      )
      setInitiateStatus(InitiateTxStates.Confirming);
      setInitiateStatus(InitiateTxStates.Done);
      setTxHash(_txHash ?? null)
    } catch (error) {
      alert("sicoo")
    }
  }

  function getButtonText() {
    if (txHash) {
      return "Close"
    }

    return "Initiate Withdraw"
  }

  return (
    <div className="transaction-details-modal flex flex-col items-center">
      <div className="transaction-details-header flex flex-row items-center justify-between">
        <div></div>
        <span>Withdraw</span>
        <div onClick={closeModal}>
          <Cross crossClassName="modal-cross" />
        </div>
      </div>

      <TransactionDirection from={from} />

      <div className="status-panel">
        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row items-center">
            <div className="white-text" style={{ fontSize: "16px" }}>
              1. Initiate Withdraw
            </div>
            {txHash && (
              <div className="gray-text">
                <a
                  href={`https://eclipsescan.xyz/tx/${txHash}?cluster=${eclipseExplorer}`}
                  target="_blank"
                >
                  View Txn
                </a>
              </div>
            )}
          </div>
          <div
            className={`flex flex-row items-center gap-1 ${ initiateStatus === InitiateTxStates.Done ? "completed" : "loading" }-item status-item`}
          >
            <TransactionIcon
              iconType={ initiateStatus === InitiateTxStates.Done ? "completed" : "loading" }
              className="tx-done-icon"
              isGreen={true}
            />
            <span>
              { initiateStatus }
            </span>
          </div>
        </div>

        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className={initiateStatus === InitiateTxStates.Done ? "white-text" : "gray-text"}>
              2. Wait 7 days
            </div>
          </div>
          {initiateStatus === InitiateTxStates.Done && (
            <div
              className={`flex flex-row items-center gap-1 ${waitingPeriodStatus === WaitingPeriodState.Waiting ? "loading" : "completed"}-item status-item`}
            >
              <TransactionIcon
                iconType={waitingPeriodStatus === WaitingPeriodState.Waiting ? "loading" : "completed"}
                className="tx-done-icon"
                isGreen={true}
              />
              <span>
                {waitingPeriodStatus === WaitingPeriodState.Ready ? (
                  "Done"
                ) : (
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <p>Waiting</p> <p className="green-text">$DAYS_LEFT$</p>
                  </div>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row items-center">
            <div className={tx ? "white-text" : "gray-text"}>
              3. Ready for Claim 
            </div>
            <div className="gray-text">
              {eclipseTx && (
                <a
                  href={`https://explorer.eclipse.xyz/tx/${eclipseTx}?cluster=${eclipseExplorer}`}
                  target="_blank"
                >
                  View Txn
                </a>
              )}
            </div>
          </div>
          {tx && transaction?.pdaData && (
            <div
              className={`flex flex-row items-center gap-1 ${depositStatus}-item status-item`}
            >
              <TransactionIcon
                iconType={depositStatus}
                className="tx-done-icon"
              />
              <span>
                {depositStatus === "completed" ? "Done" : "Processing"}
              </span>
            </div>
          )}
        </div>
      </div>
      {
        <div
          className="flex w-full flex-col"
          style={{ marginTop: "30px", gap: "12px", padding: "0 10px" }}
        >

          <TxInfo 
            name="Withdraw Amount" 
            grayText={`$${ethPrice && (Number(ethAmount) * ethPrice).toFixed(2)}`}
            greenText={`${Number(ethAmount).toFixed(3)} ETH`}
          />

          <TxInfo 
            name="Waiting Period" 
            grayText={``}
            greenText={`~7 Days`}
          />

          <TxInfo 
            name="Transaction Fee" 
            grayText={`$${ethPrice && (Number(totalFee) * ethPrice).toFixed(5)}`}
            greenText={`${Number(totalFee).toFixed(4)} ETH`}
          />

          <div className="flex flex-row justify-between items-center">
            <span className="info-name">Asset</span>
            <div className="flex flex-row gap-2 items-center">
              <img
                src="eth.png"
                alt="Ethereum"
                style={{
                  objectFit: "cover",
                  height: "16px",
                  width: "16px"
                }}
              />
              <span className="green-text">Ethereum</span>
            </div>
          </div>

          {(from ? eclipseTx : true) && (
            <TxInfo 
              name="Age" 
              grayText={""}
              greenText={timeAgo(tx.timeStamp)}
            />
          )}
        </div>
      }

      {txHash && (
        <div className="flex w-full items-center justify-center modal-info-withdraw mb-[20px]">
          {" "}
          You may close this window anytime
        </div>
      )}

      { !txHash && <div className="
            flex w-full items-center justify-center 
            py-[4px] px-[8px] h-[42px]
            rounded-[10px]
            bg-[#a1fea00d] gap-[12px] text-[16px] font-medium
            text-[#a1fea099] mt-[30px]
            border-[1px] border-[#a1fea01a]
            h-[66px] text-left 
            cursor-pointer mb-[10px]
      ">
          <CheckGreen />
          <span className="w-[396px]">
            I understand that  it will take 7 days until my funds are ready to claim on Ethereum Mainnet.
          </span>
      </div> }

      {
        <button onClick={txHash ? closeModal : handleInitiate } className="initiate-button">
          { getButtonText() }
        </button>
      }
    </div>
  );
};

