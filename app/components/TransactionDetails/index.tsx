import "./transaction-details.css";

import { useContext, useEffect } from "react";
import { Cross, Arrow, TransactionIcon } from "../icons";
import { timeAgo } from "@/lib/activityUtils";
import { ethers } from "ethers";
import { EthereumDataContext } from "@/app/context";
import { useTransaction } from "../TransactionPool";
import { useSidebar } from "@/app/contexts/SidebarContext";
import { composeEclipsescanUrl, composeEtherscanCompatibleTxPath, composeEtherscanUrl, useNetwork } from "@/app/contexts/NetworkContext"; 
import { Options } from "@/lib/networkUtils";

interface TransactionDetailsProps {
  from: "deposit" | "withdraw" | "";
  closeModal: () => void;
  tx: any;
  ethStatus?: string;
}

enum TxStatus {
  Completed = "completed",
  Loading = "loading",
  Failed = "failed"
}

const calculateFee = (gasPrice: string, gasUsed: string) => {
  const gasPriceBN = ethers.BigNumber.from(gasPrice);
  const gasUsedBN = ethers.BigNumber.from(gasUsed);
  const gasFee = gasPriceBN.mul(gasUsedBN);
  return ethers.utils.formatEther(gasFee);
};

const TransactionDirection: React.FC<{from: string}> = ({ from }) => { 
  const { selectedOption } = useNetwork();
  const isMainnet = (selectedOption === Options.Mainnet);

  const chains = [
    { src: "eth.png", name: "Ethereum" },
    { src: isMainnet ? "eclipse.png" : "eclipse-testnet.png", name: "Eclipse" },
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

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  from,
  closeModal,
  tx,
  ethStatus,
}) => {
  const [_, ethPrice] = useContext(EthereumDataContext) ?? [0, 0];
  const { transactions, addTransactionListener } = useTransaction();
  const { isSidebar } = useSidebar();
  const { selectedOption } = useNetwork();

  const transaction = tx && transactions.get(tx.hash);

  const eclipseTx = transaction?.eclipseTxHash ?? null;
  const ethAmount = tx && Number(ethers.utils.formatEther(tx.value));
  const totalFee = tx && calculateFee(tx.gasPrice, tx.gasUsed);

  const depositStatus: TxStatus = transaction?.pdaData ? TxStatus.Completed : TxStatus.Loading;
  const ethTxStatus = tx 
      ? (tx.txreceipt_status === "0" ? TxStatus.Failed : TxStatus.Completed) 
      : TxStatus.Loading;

  useEffect(() => {
    tx && addTransactionListener(tx.hash, tx.txreceipt_status);
  }, [tx]);

  return (
    <div className={ `transaction-details-modal flex flex-col items-center ${ isSidebar ? 'sm:ml-[110px]' : 'sm:ml-[34px]' }` }>
      <div className="transaction-details-header flex flex-row items-center justify-between">
        <div></div>
        <span>Deposit</span>
        <div onClick={ closeModal }>
          <Cross crossClassName="modal-cross" />
        </div>
      </div>

      <TransactionDirection from={from} />

      <div className="status-panel">
        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row items-center">
            <div className="white-text" style={{ fontSize: "16px" }}>
              1. Confirming transaction
            </div>
            {tx && (
              <div className="gray-text">
                <a
                  href={composeEtherscanUrl(selectedOption, composeEtherscanCompatibleTxPath(tx.hash))}
                  target="_blank"
                >
                  View Txn
                </a>
              </div>
            )}
          </div>
          <div
            className={`flex flex-row items-center gap-1 ${ethTxStatus}-item status-item`}
          >
            <TransactionIcon
              iconType={ethTxStatus}
              className="tx-done-icon"
              isGreen={true}
            />
            <span>
              {ethTxStatus === TxStatus.Completed ? "Done" : tx ? "Failed" : ethStatus}
            </span>
          </div>
        </div>

        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className={tx ? "white-text" : "gray-text"}>2. Depositing</div>
          </div>
          {tx && ethTxStatus === TxStatus.Completed && (
            <div
              className={`flex flex-row items-center gap-1 ${depositStatus}-item status-item`}
            >
              <TransactionIcon
                iconType={depositStatus}
                className="tx-done-icon"
                isGreen={true}
              />
              <span>
                {depositStatus === TxStatus.Completed ? (
                  "Done"
                ) : (
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <p>Processing</p> <p className="green-text">~5 mins</p>
                  </div>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row items-center">
            <div className={tx ? "white-text" : "gray-text"}>
              3. Receive on Eclipse
            </div>
            <div className="gray-text">
              {eclipseTx && (
                <a
                  href={composeEclipsescanUrl(selectedOption, composeEtherscanCompatibleTxPath(eclipseTx))}
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
      {tx && (
        <div
          className="flex w-full flex-col"
          style={{ marginTop: "30px", gap: "12px", padding: "0 10px" }}
        >

          <TxInfo 
            name="Deposit Amount" 
            grayText={`$${ethPrice && (ethAmount * ethPrice).toFixed(2)}`}
            greenText={`${Number(ethAmount).toFixed(3)} ETH`}
          />

          <TxInfo 
            name="Transaction Fee" 
            grayText={`$${ethPrice && (Number(totalFee) * ethPrice).toFixed(3)}`}
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
      )}

      {tx && !eclipseTx && from && (
        <div className="flex w-full items-center justify-center modal-info">
          {" "}
          You may close this window anytime
        </div>
      )}
      {tx && (
        <button onClick={closeModal} className="done-button">
          Done
        </button>
      )}
    </div>
  );
};
