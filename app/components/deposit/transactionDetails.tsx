import "./transaction-details.css"
import { Cross, Arrow } from "../icons"
import { TransactionIcon } from "../icons";

export const TransactionDetails = () =>  {
  return (
    <div className="transaction-details-modal flex flex-col items-center">
      <div className="transaction-details-header flex flex-row items-center justify-between">
        <div></div>
        <span>Deposit</span>
        <Cross crossClassName="modal-cross" />
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
            <div className="gray-text">View Txn</div>
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
            <div className="gray-text">View Txn</div>
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
              <span className="gray-text">$3,705</span>
              <span className="green-text">1.235 ETH</span>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center">
            <span className="info-name">Transaction Fee</span>
            <div className="flex flex-row gap-2">
              <span className="gray-text">$1.348</span>
              <span className="green-text">0.0004 ETH</span>
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
              <span className="green-text">1 Min ago</span>
            </div>
          </div>
        </div>

        <button className="done-button">Done</button>
      </div>
    </div>
  )
};

