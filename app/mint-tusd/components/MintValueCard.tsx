import { Cross } from "@/app/components/icons";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";
import { formatUnits } from "viem";
import { SelectOption, EcSelect } from "./EcSelect";
import Skeleton from "react-loading-skeleton";

interface MintValueCardProps {
  title: string;
  chainName: string;
  chainIconImg: string;
  userAddress: string | undefined; // evm address or svm address
  depositAsset: SelectOption | undefined;
  inputValue: string;
  onChangeInput?: (val: string) => void;
  onChangeDepositAsset?: (val: SelectOption) => void;
  disabled?: boolean;
  chainSelectDisabled?: boolean;
  isOverBalance?: boolean;
  tokenBalance?: bigint;
  onClickMax?: () => void;
  onClickFiftyPercent?: () => void;
  loadingTokenBalance?: boolean;
  usdValue: string;
  handleDisconnect: () => void;
  tokenOptions: SelectOption[];
  onChangeChain?: (val: SelectOption) => void;
  selectedChain?: SelectOption;
  chainOptions?: SelectOption[];
  loadingTethBalance?: boolean;
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
  onClickFiftyPercent,
  loadingTokenBalance,
  usdValue,
  handleDisconnect,
  tokenOptions,
  selectedChain,
  onChangeChain,
  chainOptions,
  chainSelectDisabled,
  loadingTethBalance,
}: MintValueCardProps) {
  ///////////////////
  // Derived values
  ///////////////////
  const trimmedUserAddress = userAddress ? userAddress.slice(0, 5) + "•••" + userAddress.slice(-3) : "";
  const formattedTokenBalance = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)).toFixed(4) : "0.00";
  const formattedUsdValue = usdValue ? parseFloat(usdValue).toFixed(2) : "$0.00";

  return (
    <div className="mint-card">
      <div className="mint-card-header">
        <div className="flex items-center gap-3">
          <p className="font-medium text-base text-white/30">{title}</p>
          <EcSelect
            disabled={chainSelectDisabled}
            smallText
            options={chainOptions}
            selected={selectedChain}
            onChange={onChangeChain || (() => {})}
          />
        </div>
        {trimmedUserAddress && (
          <div onClick={handleDisconnect} className="disconnect gap-[8px]">
            <span className="addr text-base">{trimmedUserAddress}</span>
            <Cross crossClassName="deposit-cross" />
          </div>
        )}
      </div>
      <div className="px-6 pt-4 flex flex-col">
        <div className="flex justify-between items-center">
          <input
            className={`mint-input max-w-[250px] ${disabled ? "mint-input-disabled" : ""} ${
              isOverBalance ? "mint-input-error" : ""
            }`}
            value={inputValue}
            onChange={(e) => {
              onChangeInput?.(e.target.value);
            }}
            placeholder="0"
            disabled={disabled}
          />
          {/* token selector */}
          <EcSelect
            options={tokenOptions}
            selected={depositAsset}
            disabled={tokenOptions.length <= 1}
            onChange={onChangeDepositAsset || (() => {})}
          />
        </div>
        <div className="flex justify-between mt-2 mb-3">
          <div>
            <p className="font-medium text-white/30">{usdValue}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2">
              <Image src="/wallet.svg" alt="wallet" width={18} height={18} />
              {loadingTethBalance ? (
                <Skeleton width={75} height={18} />
              ) : (
                <p className="token-balance self-start">{formattedTokenBalance}</p>
              )}
            </div>
            {(onClickMax || onClickFiftyPercent) && <p className="text-white/30">•</p>}
            {onClickFiftyPercent !== undefined && (
              <div>
                <button className="max-button" onClick={onClickFiftyPercent}>
                  50%
                </button>
              </div>
            )}
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
    </div>
  );
}
