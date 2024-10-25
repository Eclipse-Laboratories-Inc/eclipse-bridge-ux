import Image from "next/image";
import { formatUnits } from "viem";
import { tokenOptions } from "../constants/tokens";
import { TokenOption, TokenSelect } from "./TokenSelect";

interface MintValueCardProps {
  title: string;
  chainName: string;
  chainIconImg: string;
  userAddress: string | undefined; // evm address or svm address
  depositAsset: TokenOption | undefined;
  inputValue: string;
  onChangeInput?: (val: string) => void;
  onChangeDepositAsset?: (val: TokenOption) => void;
  disabled?: boolean;
  isOverBalance?: boolean;
  tokenBalance?: bigint;
  onClickMax?: () => void;
  loadingTokenBalance?: boolean;
}

export function MintValueCard({
  title,
  chainName,
  chainIconImg,
  userAddress,
  inputValue,
  onChangeInput,
  depositAsset,
  onChangeDepositAsset,
  disabled,
  isOverBalance,
  tokenBalance,
  onClickMax,
  loadingTokenBalance,
}: MintValueCardProps) {
  ///////////////////
  // Derived values
  ///////////////////
  const trimmedUserAddress = userAddress ? userAddress.slice(0, 5) + "•••" + userAddress.slice(-3) : "";
  const formattedTokenBalance = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)).toFixed(4) : "0.00";

  return (
    <div className="mint-value-card">
      <div className="mint-value-header">
        <div className="flex items-center gap-3">
          <p className="font-medium text-base text-white/30">{title}</p>
          <div className="mint-chip">
            <Image src={chainIconImg} alt={chainName} width={21} height={21} />
            <p className="font-medium text-base">{chainName}</p>
          </div>
        </div>
        <div>
          <p className="text-white/30 text-base">{trimmedUserAddress}</p>
        </div>
      </div>
      <div className="px-6 pt-4 flex flex-col">
        <div className="flex justify-between items-center">
          <input
            className={`mint-input max-w-[250px] ${disabled ? "mint-input-disabled" : ""} ${
              isOverBalance ? "mint-input-error" : ""
            }`}
            value={inputValue}
            onChange={(e) => onChangeInput?.(e.target.value)}
            placeholder="0"
            disabled={disabled}
          />
          {/* token selector */}
          <TokenSelect
            options={tokenOptions}
            selected={depositAsset}
            disabled={disabled}
            onChange={onChangeDepositAsset || (() => {})}
          />
        </div>
        <div className="flex justify-between mt-2 mb-3">
          <div className="flex gap-2">
            <Image src="/wallet.svg" alt="wallet" width={18} height={18} />
            <p className="token-balance self-start">{formattedTokenBalance}</p>
          </div>
          {onClickMax !== undefined && (
            <div>
              <button className="max-button" onClick={onClickMax}>
                Max
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
