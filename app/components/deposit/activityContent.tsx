import { Arrow } from "@/app/components/icons";
import { TransactionIcon } from "../icons";
import "./activity.css";

export const ActivityContent = () => {
  return ( 
    <div className="activity-container">

      <div className="deposit-transaction flex flex-row">
            <img src="swap.png" alt="Swap" className="swap-image" style={{position: "absolute", width: "22px"}} hidden />
            <img src="eth.png" alt="Ethereum" style={{ objectFit: "cover", height: "53px", width: "53px", marginLeft: "5px", marginRight: "16px"}} />
          <div className="flex flex-col justify-center" style={{width: "85%"}}>
            <div className="transaction-top flex justify-between">
              <div className="flex tx-age" style={{ gap: "7px"}}>
                <span className="gray-in">Deposit</span>
                <span className="gray-in">•</span>
                <span className="gray-in">1 min ago</span>
              </div>

              <div className="flex flex-row items-center status-div loading">
                <TransactionIcon iconType="loading"/> 
                <span>Depositing</span>
              </div>
            </div>
            <div className="transaction-bottom flex justify-between">
              <div className="flex flex-row items-center eth-to-ecl" style={{gap: "14px"}}>
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
