"use client";

import { useState } from "react";
import { cn } from "@/lib/classnameUtils";
import { Arrow, InstantIcon, Cross, Copy, CircleCheck } from "@/app/components/icons";
import { useSidebar } from "@/app/contexts/SidebarContext";
import { timeAgo } from "@/lib/activityUtils"
import { truncateWalletAddress } from "@/lib/stringUtils";

const TxInfo: React.FC<{
  name: string;
  grayText?: string;
  greenText?: string;
  redText?: string;
  assetIcon?: string;
}> = ({ name, grayText, greenText, redText, assetIcon }) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <span className="info-name">{name}</span>
      <div className="flex flex-row gap-2">
        {assetIcon && (
          <img src={assetIcon} className="w-[16px] h-[16px]" alt="" />
        )}
        { grayText && <span className="gray-text font-medium"> {grayText} </span> }
        { greenText && <span className="green-text"> {greenText} </span> }
        { redText && <span className="text-base font-medium text-[#EC796B]">{redText}</span>}
      </div>
    </div>
  );
};

const AddressInfo = ({ name, address }: { name: string, address: string}) => {
  const [isCopied, setIsCopied] = useState<boolean>();

  return (
    <div className="flex flex-row justify-between items-center">
      <span className="info-name">{name}</span>
      <div 
        className="flex flex-row gap-[8px] items-center cursor-pointer copy-address transition-all active:scale-[0.96]"
        onClick={() => { setIsCopied(true); navigator.clipboard.writeText(address); setTimeout(() => { setIsCopied(false) }, 1000) }}>
        <span className="gray-text font-medium"> {truncateWalletAddress(address)}</span>
        { isCopied 
          ? <CircleCheck circleClassName="modal-circle" />
          : <Copy copyClassName="w-[16px] h-[16px]"/> 
        }
      </div>
    </div>
  );
}

const RelayBridgeItem = ({
  amountToken,
  amountUsd,
  chainId,
  logoURI
}: {
  amountToken: string;
  amountUsd: string;
  chainId: string;
  logoURI: string;
}) => {
  return (
    <div
      className={cn(
        "flex w-[188px] flex-col p-[16px]",
        "border-[1px] border-[#FFFFFF1A] rounded-[10px]",
      )}
    >
      <div className="w-[37.5px] h-[37.5px] relative flex">
        <img src={logoURI} alt="" />
        <div
          className="w-[19px] h-[19px] border-[2.5px] border-black rounded-[5px] absolute"
          style={{
            backgroundImage: `url('https://assets.relay.link/icons/square/${chainId}/light.png')`,
            right: "-1px",
            bottom: "-1px",
            backgroundSize: "cover",
          }}
        ></div>
      </div>
      <p className="text-base font-bold leading-5 mt-[10px] text-left">{amountToken}</p>
      <p className="text-base text-[#FFFFFF4D] font-medium leading-5 mt-[4px] text-left">
        {amountUsd}
      </p>
    </div>
  );
};

export const InstantTransactionDetails = ({
  activity,
  closeModal,
}: {
  activity: any;
  closeModal: () => void;
}) => {
  const { isSidebar } = useSidebar();
  const txData = activity.data;
  const currencyIn = txData.metadata.currencyIn;
  const currencyOut = txData.metadata.currencyOut;

  const priceImpact = (Number(currencyOut.amountUsd) - Number(currencyIn.amountUsd)) / Number(currencyIn.amountUsd) * 100

  const transactionFeeUsd = (Number(txData.feesUsd.gas) + Number(txData.feesUsd.price)) / 10**6
  const transactionFeeToken = (Number(txData.fees.gas) + Number(txData.fees.price)) / 10**(txData.feeCurrencyObject.decimals) 

  return (
    <div
      className={cn(
        "transaction-details-modal",
        "flex flex-col items-center w-[494px] p-5 gap-[30px]",
        "rounded-[30px] border-[1px] border-[#FFFFFF1A] bg-[#FFFFFF05]",
        isSidebar ? "sm:ml-[110px]" : "sm:ml-[34px]"
      )}
    >
      <div className={cn("flex flex-row w-full justify-between items-center")}>
        <div></div>
        <div className="flex flex-row items-center gap-2">
          <InstantIcon className="white-instant" />
          <p className="text-[20px] font-medium">Instant Deposit</p>
        </div>
        <div onClick={closeModal}>
          <Cross crossClassName="w-[18px] h-[18px] instant-cross cursor-pointer" />
        </div>
      </div>

      <div
        className={cn(
          "flex items-center p-[10px] justify-between self-stretch",
          "bg-[#FFFFFF08] rounded-[20px]",
        )}
      >
        <RelayBridgeItem
          amountToken={ Number(currencyIn.amountFormatted).toFixed(5) }
          amountUsd={ `$${Number(currencyIn.amountUsd).toFixed(2)}` }
          chainId={ currencyIn.currency.chainId }
          logoURI={ currencyIn.currency.metadata.logoURI }
        />
        <div className="p-[8px]">
          <Arrow />
        </div>
        <RelayBridgeItem
          amountToken={ Number(currencyOut.amountFormatted).toFixed(5) }
          amountUsd={ `$${Number(currencyOut.amountUsd).toFixed(2)}` }
          chainId={ currencyOut.currency.chainId  }
          logoURI={ currencyOut.currency.metadata.logoURI }
        />
      </div>

      <div className="flex flex-col w-[426px] gap-[12px]">
        <TxInfo 
          name="Deposit Amount" 
          grayText={ `$${Number(currencyIn.amountUsd).toFixed(2)}` } 
          greenText={ Number(currencyIn.amountFormatted).toFixed(5) } 
        />
        <TxInfo
          name="Transaction Fee"
          grayText={`$${transactionFeeUsd.toFixed(3)}`}
          greenText={`${transactionFeeToken.toFixed(5)} ${txData.feeCurrencyObject.symbol}`}
        />
        { priceImpact > 0 
          ? <TxInfo name="Price Impact" greenText={ `${priceImpact.toFixed(2)}%` }/>
          : <TxInfo name="Price Impact" redText={ `${priceImpact.toFixed(2)}%` }/>
        }
        <TxInfo name="Asset" greenText="Ethereum" assetIcon={ currencyOut.currency.metadata.logoURI } />
        <TxInfo name="Age" greenText={timeAgo(txData.inTxs[0].timestamp)} />

        <div className="dash-box !m-0 "></div>
        <AddressInfo name="From address" address={ activity.user } />
        <AddressInfo name="To address" address={activity.recipient } />
      </div>

      <button
        className={cn(
          "w-full p-[16px] rounded-[10px] bg-[#FFFFFF0D]",
          "text-white items-center justify-center text-[20px] font-medium",
          "active:scale-95 transition-all",
        )}
        onClick={closeModal}
      >
        <p>Done</p>
      </button>
    </div>
  );
};
