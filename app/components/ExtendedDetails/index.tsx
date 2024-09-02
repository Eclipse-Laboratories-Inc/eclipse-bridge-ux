import React, { useContext, useEffect } from 'react';
import  { DataArray, EthereumDataContext } from "@/app/context";
import useEthereumData from "@/lib/ethUtils";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import "./styles.css"
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";

const ExtendedDetails: React.FC<{amountEther: undefined | string | number}> = ({ amountEther }) => {
  const [gasPrice, ethPrice] = useContext(EthereumDataContext) ?? [null, null];
  const amountEth = (typeof amountEther === "string" ? parseFloat(amountEther) : amountEther)

  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find(w => w.chain == "SOL");
  const evmWallet = userWallets.find(w => w.chain == "EVM");

  if (solWallet && evmWallet)
  return (
    <div className="extended-details">
      <div className="flex flex-row justify-between items-center single-line">
        <div><span className="white-text">Receive on Eclipse</span></div>
        <div className="flex gap-2 items-center">
        {(gasPrice && ethPrice)
            ? (amountEth && amountEth >= 0.002) 
              ? <>
                  <span className="gray-text">${(amountEth * ethPrice).toFixed(2)}</span>
                  <span className="green-text">{ amountEther } ETH</span>
                </>
              : <span className="gray-text">-</span>

            : <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                <Skeleton width={80} />
              </SkeletonTheme>
        }
        </div>
      </div>


      <div className="flex flex-row justify-between items-center single-line">
        <div><span className="white-text">Transfer Time</span></div>
        <div className="flex gap-2 items-center">
        {(amountEth)
            ? <span className="green-text">~ 5 mins</span>
            : <span className="gray-text">-</span>
        }
        </div>
      </div>


      <div className="flex flex-row justify-between items-center single-line">
        <div><span className="white-text">Network Fee</span></div>
        <div className="flex gap-2 items-center">
        {(gasPrice && ethPrice)
            ? (amountEth && amountEth >= 0.002) 
              ? <>
                  <span className="gray-text">${(113200 * gasPrice * ethPrice / 10**9).toFixed(2)}</span>
                  <span className="green-text">{(113200 * (gasPrice) / 10**9).toFixed(4)} ETH</span>
                </>
              : <span className="gray-text">-</span>

            : <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                <Skeleton width={80} />
              </SkeletonTheme>
        }
        </div>
      </div>
    </div>
  );
};

export default ExtendedDetails;

