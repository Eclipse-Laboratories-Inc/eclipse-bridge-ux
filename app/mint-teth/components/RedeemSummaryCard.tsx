import React from "react";
import { tokenOptions } from "../constants/tokens";
import { formatUnits } from "viem";
import Image from "next/image";
import "./styles.css";
import { Tooltip } from "./Tooltip";

interface RedeemSummaryCardProps {
  depositAsset: string;
  exchangeRate: string;
  withdrawFee: string;
  totalFees: string;
  bridgeFee: string;
}

export function RedeemSummaryCard({
  depositAsset,
  exchangeRate,
  withdrawFee,
  totalFees,
  bridgeFee,
}: RedeemSummaryCardProps) {
  const depositAssetSymbol = tokenOptions.find((token) => token.value === depositAsset)?.label;
  const tEthValue = exchangeRate ? 1 / Number(formatUnits(BigInt(exchangeRate), 18)) : 0;
  const formattedExchangeRate = `1 ${depositAssetSymbol} = ${tEthValue.toFixed(3)} tETH`;

  return (
    <div className="mint-card">
      <div className="redeem-summary-grid">
        <div className="redeem-summary-item">
          <p className="standard-text">{formattedExchangeRate}</p>
        </div>
        <div className="redeem-summary-item">
          <p className="standard-text">Total Cost</p>
          <p className="green-mint-text-sm">{totalFees}</p>
        </div>
        <div className="redeem-summary-item flex items-center">
          <p className="standard-text">Withdraw Fee</p>
          <Tooltip text="Fees are used to pay for gas and slippage costs incurred by solvers." />
        </div>
        <div className="redeem-summary-item">
          <p className="green-mint-text-sm">{withdrawFee}</p>
        </div>
        <div className="redeem-summary-item">
          <p className="standard-text">Bridge Fee</p>
          <Tooltip text="Fee charged by Hyperlane, the underlying bridge provider." />
        </div>
        <div className="redeem-summary-item">
          <p className="green-mint-text-sm">{bridgeFee}</p>
        </div>
        <div className="redeem-summary-item">
          <p className="standard-text">Deadline</p>
          <Tooltip text="Time past which the order will automatically expire and cancel." />
        </div>
        <div className="redeem-summary-item">
          <p className="green-mint-text-sm">7 Days</p>
        </div>
      </div>
      <div className="border-t border-[#252525] flex justify-center gap-1 items-center p-3">
        <p className="text-white/30 text-sm font-medium">Powered by</p>
        <Image src="/nucleus.svg" alt="nucleus" width={16} height={16} />
        <p className="text-white/30 text-sm font-medium">Nucleus</p>
      </div>
    </div>
  );
}
