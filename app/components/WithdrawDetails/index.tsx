import "./transaction-details.css";
import { useContext, useEffect, useState } from "react";
import { Cross, Arrow, TransactionIcon } from "../icons";
import { timeAgo, timeLeft } from "@/lib/activityUtils";
import { EthereumDataContext } from "@/app/context";
import { Transport, Chain, Account } from 'viem';
import { useTransaction } from "../TransactionPool";
import { createPublicClient, http, WalletClient } from 'viem';
import { mainnet, sepolia } from "viem/chains";
import { CONTRACT_ABI, WITHDRAW_TX_FEE } from "../constants";
import { composeEclipsescanUrl, composeEtherscanCompatibleTxPath, useNetwork } from "@/app/contexts/NetworkContext"; 
import { withdrawEthereum, byteArrayToHex, convertLosslessToNumbers, WithdrawObject } from "@/lib/withdrawUtils"
import { useWallets } from "@/app/hooks/useWallets";
import { Options } from "@/lib/networkUtils";

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
  NotReady = "",
  InWallet = "Approve in wallet",
  Confirming = "Confirming",
  Done = "Done"
} 

enum WaitingPeriodState {
  Waiting = "Waiting",
  Ready = "Done",
  Closed = "Closed"
}

// we will have 3 states
//
// 1 initiate transaction state
// 2 waiting period state
// 3 claim 
//
//

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
  const { transactions, deposits, withdrawals, setWithdrawals, withdrawTransactions } = useTransaction();
  const { waitingPeriod, relayerAddress, configAccount, eclipseRpc, bridgeProgram, selectedOption, contractAddress } = useNetwork();
  const { userWallets, evmWallet, solWallet } = useWallets();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [checkbox, setCheckbox] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(ethAmount as number); 
  const [isClaimFlowOpen, setIsClaimFlowOpen] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Claim Now");

  const [initiateStatus, setInitiateStatus] = useState<InitiateTxStates>(InitiateTxStates.NotReady);
  const [waitingPeriodStatus, setWaitingPeriodStatus] = useState<WaitingPeriodState>(WaitingPeriodState.Waiting);

  useEffect(() => {
    if (!tx) return;
    const withdrawal = withdrawTransactions.get(tx[0].message.withdraw_id);
    setTxHash(withdrawal?.transaction ? withdrawal?.transaction.signature : '0xhash')

    const hexAmount = tx[0].message.amount_wei;
    setWithdrawAmount(Number(parseInt(hexAmount, 16)) / 10**18);
  }, [tx])

  useEffect(() => {
    if (!tx) return;
    if (tx[1] === 'Processing') setWaitingPeriodStatus(WaitingPeriodState.Waiting);
    if (tx[1] === 'Pending') setWaitingPeriodStatus(WaitingPeriodState.Ready);
    if (tx[1] === 'Closed') setWaitingPeriodStatus(WaitingPeriodState.Closed);
  }, [])

  const submitClaim = async () => {
    setIsClaimFlowOpen(true);
    setButtonText("Approve Transaction");
    const isMainnet = (selectedOption === Options.Mainnet);
    let walletClient = evmWallet?.connector.getWalletClient<WalletClient<Transport, Chain, Account>>();
    const client = createPublicClient({
      chain: isMainnet ? mainnet : sepolia,
      transport: isMainnet 
        ? http("https://empty-responsive-patron.quiknode.pro/91dfa8475605dcdec9afdc8273578c9f349774a1/") 
        : http("https://ethereum-sepolia-rpc.publicnode.com"),
      cacheTime: 0
    })
    const [account] = await walletClient!.getAddresses()
    const message = {
      from: '0x' + byteArrayToHex(convertLosslessToNumbers(tx[0].message.from)), 
      destination: tx[0].message.destination, 
      amountWei: tx[0].message.amount_wei, 
      withdrawId: tx[0].message.withdraw_id, 
      feeReceiver: tx[0].message.fee_receiver, 
      feeWei: tx[0].message.fee_wei
    }
    try {
      const { request } = await client.simulateContract({
        //@ts-ignore
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'claimWithdraw',
        args: [message],
        account,
        value: BigInt(0),
        chain: isMainnet ? mainnet : sepolia
      })
      let txResponse = await walletClient!.writeContract(request);
      if (!txResponse.startsWith("0x"))
        txResponse = `0x${txResponse}`

      setButtonText("Confirming Transaction");
      await client.waitForTransactionReceipt({ hash: txResponse, retryCount: 150, retryDelay: 2_000, confirmations: 1 }); 
      setWaitingPeriodStatus(WaitingPeriodState.Closed);

      const updatedWithdrawals = withdrawals!.map((item) =>
        item[0].message.withdraw_id === tx[0].message.withdraw_id 
          ? [item[0], "Closed"] as WithdrawObject
          : item 
      );
      setWithdrawals(updatedWithdrawals);

    } catch (error) {
      console.log(error, "claim error")
    }
    setIsClaimFlowOpen(false);
    setButtonText("Claim Now");
  }

  const transaction = tx && transactions.get(tx.hash);

  const eclipseTx = transaction?.eclipseTxHash ?? null;

  const handleInitiate = async () => {
    if (!checkbox) { return; }

    setInitiateStatus(InitiateTxStates.InWallet);
    try {
       let _txHash = await withdrawEthereum(
        solWallet?.connector.getSigner(),
        evmWallet?.address || "",
        eclipseRpc,
        configAccount,
        relayerAddress,
        bridgeProgram,
        ethAmount as number
      )
      setInitiateStatus(InitiateTxStates.Confirming);
      setInitiateStatus(InitiateTxStates.Done);
      setTxHash(_txHash ?? null)
    } catch (error) {
    }
  }

  function getButtonText() {
    if (txHash) {
      return "Close"
    }

    return "Initiate Withdrawal"
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
            <div className={ initiateStatus !== InitiateTxStates.NotReady || txHash ? "white-text" : "gray-text" } style={{ fontSize: "16px" }}>
              1. Initiate Withdraw
            </div>
            { txHash && (txHash !== '0xhash') && (
              <div className="gray-text">
                <a
                  href={composeEclipsescanUrl(selectedOption, composeEtherscanCompatibleTxPath(txHash))}
                  target="_blank"
                >
                  View Txn
                </a>
              </div>
            )}
          </div>
          { (initiateStatus !== InitiateTxStates.NotReady || txHash) && <div
            className={`flex flex-row items-center gap-1 ${ txHash ? "completed" : "loading" }-item status-item`}
          >
            <TransactionIcon
              iconType={ txHash ? "completed" : "loading" }
              className="tx-done-icon"
              isGreen={true}
            />
            <span>
              { txHash ? "Done" : initiateStatus }
            </span>
          </div> }
        </div> 

        <div className="panel-elem flex flex-row items-center justify-between">
          <div className="left-side flex flex-row">
            <div className={initiateStatus === InitiateTxStates.Done || txHash ? "white-text" : "gray-text"}>
              2. Wait { waitingPeriod } 
            </div>
          </div>
          {(initiateStatus === InitiateTxStates.Done || txHash) && (
            <div
              className={`flex flex-row items-center gap-1 ${waitingPeriodStatus === WaitingPeriodState.Waiting ? "loading" : "completed"}-item status-item`}
            >
              <TransactionIcon
                iconType={waitingPeriodStatus === WaitingPeriodState.Waiting ? "loading" : "completed"}
                className="tx-done-icon"
                isGreen={true}
              />
              <span>
                {waitingPeriodStatus === WaitingPeriodState.Ready || waitingPeriodStatus === WaitingPeriodState.Closed ? (
                  "Done"
                ) : (
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <p>Waiting</p> <p className="green-text">~ {tx ? (timeLeft(parseInt(tx[0].start_time, 16) * 1000)) : waitingPeriod}</p>
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
              {false && (
                <a
                  href={composeEclipsescanUrl(selectedOption, composeEtherscanCompatibleTxPath(eclipseTx))}
                  target="_blank"
                >
                  View Txn
                </a>
              )}
            </div>
          </div>
          {(waitingPeriodStatus === WaitingPeriodState.Ready || waitingPeriodStatus === WaitingPeriodState.Closed) && (
            <div
              className={`flex flex-row items-center gap-1 completed-item status-item`}
            >
              <TransactionIcon
                iconType={"completed"}
                className="tx-done-icon"
              />
              <span>
                Done
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
            grayText={`$${ethPrice && (Number(ethAmount ? ethAmount : withdrawAmount) * ethPrice).toFixed(2)}`}
            greenText={`${Number(ethAmount ? ethAmount : withdrawAmount).toFixed(3)} ETH`}
          />

          <TxInfo 
            name="Waiting Period" 
            grayText={``}
            greenText={ `~ ${waitingPeriod}` }
          />

          <TxInfo 
            name="Transaction Fee" 
            grayText={`$${ethPrice && (Number(WITHDRAW_TX_FEE) * ethPrice).toFixed(5)}`}
            greenText={`${Number(WITHDRAW_TX_FEE).toFixed(4)} ETH`}
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

      {txHash && (waitingPeriodStatus !== WaitingPeriodState.Ready) && (
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
      " onClick={() => setCheckbox(!checkbox)}>
          { checkbox 
            ? <CheckGreen /> 
            : <span className="w-[18px] h-[18px] border-[2px] rounded-[50%] border-[#a1fea099] ml-[7px]"></span>
          }
          <span className="w-[396px]">
            I understand that  it will take { waitingPeriod } until my funds are ready to claim on Ethereum Mainnet.
          </span>
      </div> }

      {
        waitingPeriodStatus !== WaitingPeriodState.Ready && <button 
          onClick={txHash ? closeModal : handleInitiate } 
          className={ `initiate-button ${ txHash && "!text-white !bg-[#ffffff0d]"} ${ !checkbox && "!text-white cursor-not-allowed !bg-[#ffffff0d]" }` }
        >
          { getButtonText() }
        </button>
      }
      { waitingPeriodStatus === WaitingPeriodState.Ready && 
        <button className="initiate-button !mt-[25px]" onClick={ isClaimFlowOpen ? () => {}: submitClaim }>
          { buttonText }
        </button>
      }
    </div>
  );
};
