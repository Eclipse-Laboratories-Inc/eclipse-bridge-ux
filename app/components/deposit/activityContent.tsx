import { Arrow } from "@/app/components/icons";
import { TransactionIcon } from "../icons";
import "./activity.css";

export const ActivityContent = () => {
  return ( 
    <div className="activity-container">
      <div className="deposit-transaction flex flex-row">
          <div className="flex items-center justify-center" style={{width: "18%", justifyContent: "flex-start"}}>
            <img src="swap.png" alt="Swap" className="swap-image" hidden/>
            <img src="eth.png" alt="Ethereum" style={{ objectFit: "cover", height: "53px", width: "53px"}} />
          </div>
          <div className="flex flex-col justify-center" style={{width: "85%"}}>
            <div className="transaction-top flex justify-between">
              <span className="gray-in">Deposit • 1 min ago</span>
              <div className="flex flex-row items-center status-div loading">
                <TransactionIcon iconType="loading"/> 
                <span>Depositing</span>
              </div>
            </div>
            <div className="transaction-bottom flex justify-between">
              <div className="flex flex-row items-center" style={{gap: "14px"}}>
                <span className="white-in">Ethereum</span>
                <Arrow />
                <span className="white-in">Eclipse</span>
              </div>
              <span className="white-in">1 ETH</span>
            </div>
          </div>
      </div>
    </div> 
  )
}
