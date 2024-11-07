import { useWallets } from "@/app/hooks";
import { generateTxObjectForDetails } from "@/lib/activityUtils";
import { solanaToBytes32 } from "@/lib/solanaUtils";
import { DynamicConnectButton, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { Abi, Address, erc20Abi, formatUnits, parseEther, parseUnits, PublicClient, WalletClient } from "viem";
import { mainnet } from "viem/chains";
import WarpRouteContract from "../abis/WarpRouteContract.json";
import { warpRouteContractAddress } from "../constants/contracts";
import { tethEvmTokenAddress, tethSvmTokenAddress, tokenAddresses, tokenOptions } from "../constants/tokens";
import { useTokenTransfer } from "../hooks/useTokenTransfer";
import { useUpdateAtomicRequest } from "../hooks/useUpdateAtomicRequest";
import { balanceOf } from "../lib/balanceOf";
import { getRate } from "../lib/getRate";
import { getRateInQuote } from "../lib/getRateInQuote";
import { latestRoundData } from "../lib/latestRoundData";
import { quoteGasPayment } from "../lib/quoteGasPayment";
import { getUserAtomicRequest } from "../lib/userAtomicRequest";
import { calculateMinimumMint } from "../utils/calculateMinimumMint";
import { getSolanaBalance } from "../utils/getSolanaBalance";
import { sanitizeInput } from "../utils/sanitizeInput";
import { MintTransactionDetails, StepStatus } from "./MintTransactionDetails";
import { MintValueCard } from "./MintValueCard";
import { RedeemSummaryCard } from "./RedeemSummaryCard";
import "./styles.css";
import { TokenOption } from "./TokenSelect";

export function Redeem() {
  ///////////////////////
  // Constants
  ///////////////////////
  const slippage = 0.005;
  const deadlineDaysFromNow = 7;
  const bridgeFeeInTeth = BigInt(0); // TODO: Add actual bridge fee

  ///////////////////////
  // Hooks
  ///////////////////////
  const { walletConnector, handleUnlinkWallet, rpcProviders } = useDynamicContext();
  const { evmWallet, solWallet } = useWallets();
  const {
    updateAtomicRequest,
    approvalState: atomicRequestApprovalState,
    transactionState: atomicRequestState,
  } = useUpdateAtomicRequest();
  const { triggerTransactions, transactionState: tokenTransferState } = useTokenTransfer();

  ///////////////////////
  // State
  ///////////////////////
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [redeemAmount, setRedeemAmount] = useState<string>("");
  const [receiveAsset, setReceiveAsset] = useState<`0x${string}`>(tokenAddresses[0]);
  const [assetPerTethRate, setAssetPerTethRate] = useState<string>("");
  const [ethPerAssetRate, setEthPerAssetRate] = useState("");
  const [ethPerTethRate, setEthPerTethRate] = useState("");
  const [depositPending, setDepositPending] = useState<boolean>(false);
  const [tokenBalanceAsBigInt, setTokenBalanceAsBigInt] = useState<bigint>(BigInt(0));
  const [loadingTokenBalance, setLoadingTokenBalance] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [depositTxHash, setDepositTxHash] = useState<string>("");
  const [svmBalance, setSvmBalance] = useState<string>("");
  const [ethPrice, setEthPrice] = useState<string>("");

  ///////////////////////
  // Derived values
  ///////////////////////
  const atomicPrice = (BigInt(assetPerTethRate) * BigInt(1e18)) / (BigInt(1e18) - parseUnits(slippage.toString(), 18));

  const formattedTokenBalance = formatUnits(BigInt(svmBalance), 18);
  const atomicPriceAsBigInt = BigInt(atomicPrice);
  const redeemAmountAsBigInt = parseUnits(redeemAmount, 18);

  // Withdraw fee
  const withdrawFeeInTeth = (redeemAmountAsBigInt * parseUnits(slippage.toString(), 18)) / BigInt(1e18);
  const withdrawFeeInEth = (withdrawFeeInTeth * BigInt(ethPerTethRate)) / BigInt(1e18);
  const withdrawFeeInUsdAsBigInt = (withdrawFeeInEth * BigInt(ethPrice)) / BigInt(1e8);
  const withdrawFeeInUsd = Number(formatUnits(withdrawFeeInUsdAsBigInt, 18));
  const formattedWithdrawFeeInUsd =
    withdrawFeeInUsd > 0 && withdrawFeeInUsd < 0.01
      ? "<$0.01"
      : `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          withdrawFeeInUsd
        )}`;

  // Bridge fee
  const bridgeFeeInEth = (bridgeFeeInTeth * BigInt(ethPerTethRate)) / BigInt(1e18);
  const bridgeFeeInUsdAsBigInt = (bridgeFeeInEth * BigInt(ethPrice)) / BigInt(1e8);
  const bridgeFeeInUsd = Number(formatUnits(bridgeFeeInUsdAsBigInt, 18));
  const formattedBridgeFeeInUsd =
    bridgeFeeInUsd > 0 && bridgeFeeInUsd < 0.01
      ? "<$0.01"
      : `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          bridgeFeeInUsd
        )}`;

  // Total fees
  const totalFees = withdrawFeeInTeth + bridgeFeeInTeth;
  const totalFeesInEth = (totalFees * BigInt(ethPerTethRate)) / BigInt(1e18);
  const totalFeesInUsdAsBigInt = (totalFeesInEth * BigInt(ethPrice)) / BigInt(1e8);
  const totalFeesInUsd = Number(formatUnits(totalFeesInUsdAsBigInt, 18));
  const formattedTotalFeesInUsd =
    totalFeesInUsd > 0 && totalFeesInUsd < 0.01
      ? "<$0.01"
      : `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          totalFeesInUsd
        )}`;

  const isOverBalance = BigInt(svmBalance) < redeemAmountAsBigInt;

  const isMintDisabled =
    depositPending || !redeemAmount || !receiveAsset || !evmWallet || isOverBalance || Number(redeemAmount) === 0;

  const provider = rpcProviders.evmDefaultProvider;

  const evmAddress = evmWallet?.address as `0x${string}` | undefined;
  const svmAddress = solWallet?.address as `0x${string}` | undefined;

  const ethPriceAsBigInt = ethPrice ? BigInt(ethPrice) : BigInt(0);

  // Redeem amount
  const redeemtAmountInEth = (redeemAmountAsBigInt * BigInt(ethPerAssetRate)) / BigInt(1e18);
  const redeemAmountInUsd = (redeemtAmountInEth * ethPriceAsBigInt) / BigInt(1e8);
  const redeemAmountInUsdFormatted = Number(formatUnits(redeemAmountInUsd, 18));
  const formattedRedeemAmountInUsd =
    redeemAmountInUsdFormatted > 0 && redeemAmountInUsdFormatted < 0.01
      ? "<$0.01"
      : `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          redeemAmountInUsdFormatted
        )}`;

  // Receive amount
  const receiveAmountAsBigInt =
    atomicPriceAsBigInt > BigInt(0)
      ? (redeemAmountAsBigInt * BigInt(1e18)) / atomicPriceAsBigInt
      : redeemAmountAsBigInt;
  const formattedReceiveAmount = formatUnits(receiveAmountAsBigInt, 18);
  const receiveAmountInEth = (receiveAmountAsBigInt * BigInt(ethPerTethRate)) / BigInt(1e18);
  const receiveAmountInUsd = (receiveAmountInEth * ethPriceAsBigInt) / BigInt(1e8);
  const receiveAmountInUsdFormatted = Number(formatUnits(receiveAmountInUsd, 18));
  const formattedReceiveAmountInUsd =
    receiveAmountInUsdFormatted > 0 && receiveAmountInUsdFormatted < 0.01
      ? "<$0.01"
      : `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          receiveAmountInUsdFormatted
        )}`;

  // Memoized because it iterates over an array
  const { depositAssetLabel, depositAssetIcon } = useMemo(() => {
    const tokenOption = tokenOptions.find((token) => token.value === receiveAsset);
    return { depositAssetLabel: tokenOption?.label, depositAssetIcon: tokenOption?.imageSrc };
  }, [receiveAsset]);

  // Memoized because it returns a new array on every render
  const steps = useMemo(() => {
    return [
      {
        title: "1. Approving tETH swap",
        status: atomicRequestApprovalState,
      },
      {
        title: `2. Queueing swap for tETH -> ${depositAssetLabel}`,
        status: atomicRequestState,
        link: `https://etherscan.io/tx/${depositTxHash}`,
      },
      {
        title: "3. Bridging tETH to Ethereum",
        status: tokenTransferState,
      },
    ];
  }, [atomicRequestApprovalState, atomicRequestState, depositAssetLabel, depositTxHash, tokenTransferState]);

  ///////////////////////
  // Use effects
  ///////////////////////

  // Set the balance of the SVM wallet
  useEffect(() => {
    async function getSvmBalance() {
      if (!svmAddress) return;
      const balance = await getSolanaBalance(svmAddress, tethSvmTokenAddress);
      setSvmBalance(balance.toString());
    }

    getSvmBalance();
  }, [svmAddress]);

  // Clear token balance when the wallet disconnects
  useEffect(() => {
    if (!evmWallet) {
      setTokenBalanceAsBigInt(BigInt(0));
    }
  }, [evmWallet]);

  // Set up the public and wallet clients
  useEffect(() => {
    async function loadClients() {
      if (!walletConnector) return;

      const fetchedWalletClient = walletConnector.getWalletClient(mainnet.id.toString()) as WalletClient;
      const fetchedPublicClient = (await walletConnector.getPublicClient()) as PublicClient;

      setWalletClient(fetchedWalletClient);
      setPublicClient(fetchedPublicClient);
    }

    loadClients();
  }, [walletConnector]);

  // Get an updated exchange rate every time the deposit asset changes and every 30 seconds after that.
  useEffect(() => {
    let isCancelled = false;

    async function getExchangeRate(asset: Address) {
      if (!asset || !publicClient) return;
      const rate = await getRateInQuote({ quote: asset }, { publicClient });
      let _ethPerAssetRate: BigInt;
      if (asset === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") {
        _ethPerAssetRate = BigInt(1e18);
      } else {
        _ethPerAssetRate = await getRate({ tokenAddress: asset }, { publicClient });
      }
      const _ethPerTethRate = await getRateInQuote(
        { quote: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" }, // WETH
        { publicClient }
      );
      const _ethPrice = await latestRoundData({ publicClient });

      // Only update if the asset hasn't changed
      if (!isCancelled && asset === receiveAsset) {
        setAssetPerTethRate(rate.toString());
        setEthPerAssetRate(_ethPerAssetRate.toString());
        setEthPerTethRate(_ethPerTethRate.toString());
        setEthPrice(_ethPrice.toString());
      }
    }

    getExchangeRate(receiveAsset);

    // Get an updated exchange rate every 30 seconds
    const intervalId = setInterval(() => {
      getExchangeRate(receiveAsset);
    }, 30_000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [receiveAsset, publicClient]);

  // Get the token balance
  useEffect(() => {
    async function getTokenBalance() {
      try {
        if (!publicClient || !evmWallet) return;
        setLoadingTokenBalance(true);
        const tokenBalanceAsBigInt = await balanceOf({
          tokenAddress: receiveAsset,
          userAddress: evmWallet.address as `0x${string}`,
          publicClient,
        });
        setTokenBalanceAsBigInt(tokenBalanceAsBigInt);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingTokenBalance(false);
      }
    }

    getTokenBalance();
  }, [receiveAsset, evmWallet, publicClient]);

  ///////////////////
  // Actions
  ///////////////////

  function handleRedeemAmountChange(val: string) {
    const sanitizedInput = sanitizeInput(val, redeemAmount);
    setRedeemAmount(sanitizedInput);
  }

  function handleReceiveAssetChange(val: TokenOption) {
    setReceiveAsset(val.value);
  }

  function closeModal() {
    setTimeout(() => {
      setIsModalOpen(false);
      setRedeemAmount("");
      setDepositTxHash("");
      setCurrentTx(null);
    }, 100);
  }

  function handleClickMax() {
    setRedeemAmount(formattedTokenBalance);
  }

  function handleClickFiftyPercent() {
    setRedeemAmount((parseFloat(formattedTokenBalance) / 2).toString());
  }

  async function handleRedeem() {
    setIsModalOpen(true);

    // Make the swap (this step takes up to 24 hours)
    const deadlineInSec = BigInt(Math.floor(Date.now() / 1000) + deadlineDaysFromNow * 24 * 60 * 60);
    const offerAmount = parseUnits(redeemAmount, 18);

    if (!evmAddress) throw new Error("No EVM address found");
    if (!publicClient) throw new Error("No public client found");

    // Check if the atomic request already exists.
    // If it does, skip the updateAtomicRequest step.
    // This is to prevent the user from triggering the request multiple times.
    const pendingAtomicRequest = await getUserAtomicRequest(
      { userAddress: evmAddress, offerAddress: tethEvmTokenAddress, wantAddress: receiveAsset },
      { publicClient }
    );
    const { atomicPrice: pendingAtomicPrice, offerAmount: pendingOfferAmount } = pendingAtomicRequest;
    const atomicRequestAlreadyExists = pendingAtomicPrice === atomicPrice && pendingOfferAmount === offerAmount;

    if (!atomicRequestAlreadyExists) {
      const txHash = await updateAtomicRequest(
        {
          offer: tethEvmTokenAddress,
          want: receiveAsset,
          userRequest: { deadline: deadlineInSec, atomicPrice, offerAmount, inSolve: false },
        },
        { publicClient, walletClient }
      );
    }

    // Bridge tETH from Eclipse to Ethereum
    await triggerTransactions(parseUnits(redeemAmount, 9).toString());
  }

  return (
    <>
      <div className={isModalOpen ? "mint-status-overlay active" : "mint-status-overlay"}></div>
      {isModalOpen && (
        <MintTransactionDetails
          fromDeposit={true}
          closeModal={closeModal}
          tx={currentTx}
          steps={steps}
          depositAmountAsBigInt={redeemAmountAsBigInt}
          depositAssetLabel={depositAssetLabel}
          depositAssetIcon={depositAssetIcon}
        />
      )}
      <div className="flex flex-col gap-3">
        <MintValueCard
          title="Redeem from"
          chainName="Eclipse"
          chainIconImg="/eclipse.png"
          userAddress={svmAddress}
          inputValue={redeemAmount}
          disabled={false}
          loadingTokenBalance={loadingTokenBalance}
          onChangeInput={handleRedeemAmountChange}
          depositAsset={{
            value: "0xtETH-solana",
            label: "tETH",
            imageSrc: "/token-teth.svg",
          }}
          isOverBalance={isOverBalance}
          tokenBalance={BigInt(svmBalance)}
          onClickMax={handleClickMax}
          onClickFiftyPercent={handleClickFiftyPercent}
          usdValue={formattedRedeemAmountInUsd}
          handleDisconnect={() => solWallet && handleUnlinkWallet(solWallet.id)}
          tokenOptions={[]}
        />
        <MintValueCard
          title="Receive on"
          chainName="Ethereum"
          chainIconImg="/eth.png"
          userAddress={evmAddress}
          inputValue={formattedReceiveAmount}
          disabled={true}
          depositAsset={tokenOptions.find((token) => token.value === receiveAsset)}
          tokenBalance={tokenBalanceAsBigInt}
          usdValue={formattedReceiveAmountInUsd}
          handleDisconnect={() => evmWallet && handleUnlinkWallet(evmWallet.id)}
          onChangeDepositAsset={handleReceiveAssetChange}
          tokenOptions={tokenOptions}
        />
        <RedeemSummaryCard
          depositAsset={receiveAsset}
          exchangeRate={atomicPrice.toString()}
          withdrawFee={formattedWithdrawFeeInUsd}
          bridgeFee={formattedBridgeFeeInUsd}
          totalFees={formattedTotalFeesInUsd}
        />
        {evmAddress && svmAddress && (
          <button
            className={classNames("mint-button mt-3", { "mint-button-disabled": isMintDisabled })}
            onClick={handleRedeem}
            disabled={isMintDisabled}
          >
            {depositPending ? "Redeeming..." : "Redeem"}
          </button>
        )}
        {(!evmAddress || !svmAddress) && (
          <DynamicConnectButton
            buttonClassName="wallet-connect-button w-full"
            buttonContainerClassName="submit-button connect-btn"
          >
            <span style={{ width: "100%" }}> {!evmAddress && !svmAddress ? "Connect Wallets" : "Connect Wallet"}</span>
          </DynamicConnectButton>
        )}
      </div>
    </>
  );
}
