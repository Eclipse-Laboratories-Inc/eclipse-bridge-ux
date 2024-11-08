import React, { useContext } from 'react';
import  { EthereumDataContext } from "@/app/context";
import { GasStationIcon } from "@/app/components/icons"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import "./styles.css"
import { MIN_DEPOSIT_AMOUNT } from "../constants";
import { useWallets } from "@/app/hooks/useWallets";
import MotionNumber from 'motion-number'

export interface ExtendedDetailsProps {
  amountEther: undefined | string | number;
  target: "Eclipse" | "Ethereum"
  feeInEth: number | null;
}

const TimeIcon: React.FC = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16C3.5625 16 0 12.4375 0 8C0 3.59375 3.5625 0 8 0C12.4062 0 16 3.59375 16 8C16 12.4375 12.4062 16 8 16ZM7.25 8C7.25 8.25 7.375 8.5 7.5625 8.625L10.5625 10.625C10.9062 10.875 11.375 10.7812 11.5938 10.4375C11.8438 10.0938 11.75 9.625 11.4062 9.375L8.75 7.625V3.75C8.75 3.34375 8.40625 3 7.96875 3C7.5625 3 7.21875 3.34375 7.21875 3.75L7.25 8Z" fill="white" fill-opacity="0.3"/>
    </svg>
  );
}

const GasIcon: React.FC = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 2C1 0.90625 1.875 0 3 0H8C9.09375 0 10 0.90625 10 2V8H10.25C11.75 8 13 9.25 13 10.75V11.75C13 12.1875 13.3125 12.5 13.75 12.5C14.1562 12.5 14.5 12.1875 14.5 11.75V6.9375C13.625 6.71875 13 5.9375 13 5V3L12 2C11.7188 1.75 11.7188 1.28125 12 1C12.25 0.75 12.7188 0.75 13 1L15.4062 3.4375C15.7812 3.8125 16 4.3125 16 4.84375V11.75C16 13 14.9688 14 13.75 14C12.5 14 11.5 13 11.5 11.75V10.75C11.5 10.0625 10.9375 9.5 10.25 9.5H10V14C10.5312 14 11 14.4688 11 15C11 15.5625 10.5312 16 10 16H1C0.4375 16 0 15.5625 0 15C0 14.4688 0.4375 14 1 14V2ZM3 5.5C3 5.78125 3.21875 6 3.5 6H7.5C7.75 6 8 5.78125 8 5.5V2.5C8 2.25 7.75 2 7.5 2H3.5C3.21875 2 3 2.25 3 2.5V5.5Z" fill="white" fill-opacity="0.3"/>
    </svg>
  );
}

const ExtendedDetails: React.FC<ExtendedDetailsProps> = ({ amountEther, target, feeInEth }) => {
  const [gasPrice, ethPrice] = useContext(EthereumDataContext) ?? [null, null];
  const amountEth = (typeof amountEther === "string" ? parseFloat(amountEther) : amountEther)
  const { evmWallet, solWallet } = useWallets(); 


  if ((!eclipseAddr && !solWallet) || !evmWallet) return null;

  return (
    <>
    <div className="tx-sum flex flex-col">
      <div className="route-box flex flex-row justify-between items-center">
        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Route</span>
        <div className="route-text flex items-center justify-between">Eclipse</div>
      </div>
      <div className="amount-sum flex flex-row justify-between items-center">
        <div className="flex gap-[4px]">
          <span style={{ color: "rgba(255, 255, 255, 0.3)"}}>Receive</span>
          <span className="tgreen flex items-center">
            <MotionNumber
              value={(parseFloat(String(amountEther ?? "0")) ? parseFloat(String(amountEther ?? "0")) :  0).toFixed(3)}
              format={{ notation: 'standard' }} 
              transition={{
                y: { type: 'spring', duration: 0.65, bounce: 0.25 }
              }}
              locales="en-US" 
            /> 
            <span>&nbsp;ETH</span>
          </span>
        </div>
        <div className="flex flex-row items-center" style={{ gap: "8px" }}>
          <div className="flex items-center gap-[4px]">
            <TimeIcon />
            <span className="tgreen">~5 mins</span>
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.3)"}}>•</span>
          <div className="flex items-center gap-[4px]">
            <GasIcon />
            {(feeInEth && ethPrice)
                ? (amountEth && amountEth >= MIN_DEPOSIT_AMOUNT) 
                  ? <>
                      <span className="tgreen">${(feeInEth * ethPrice).toFixed(2)}</span>
                    </>
                  : <span className="gray-text">-</span>
                : <Skeleton width={80} />
            }
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ExtendedDetails;
