import Image from "next/image";
import { formatUnits } from "viem";
import "./styles.css";
import { tokenOptions } from "../constants/tokens";

interface MintSummaryCardProps {
  depositAsset: string;
  exchangeRate: string;
}

export function MintSummaryCard({ depositAsset, exchangeRate }: MintSummaryCardProps) {
  // Derived values
  const depositAssetSymbol = tokenOptions.find((token) => token.value === depositAsset)?.label;
  const tEthValue = exchangeRate ? 1 / Number(formatUnits(BigInt(exchangeRate), 18)) : 0;
  const formattedExchangeRate = `1 ${depositAssetSymbol} = ${tEthValue.toFixed(3)} tETH`;

  return (
    <div className="mint-card">
      <div className="mint-card-header">
        <p className="text-sm text-white/60 font-medium">{formattedExchangeRate}</p>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            <Image src="/clock.svg" alt="clock" width={16} height={16} />
            <p className="green-mint-text text-sm">~5mins</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-1 items-center m-3">
        <p className="text-white/30 text-sm font-medium">Powered by</p>
        <Image src="/nucleus.svg" alt="nucleus" width={16} height={16} />
        <p className="text-white/30 text-sm font-medium">Nucleus</p>
      </div>
    </div>
  );
}
