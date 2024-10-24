import { useWallets } from "@/app/hooks";
import { generateTxObjectForDetails } from "@/lib/activityUtils";
import { solanaToBytes32 } from "@/lib/solanaUtils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { Abi, Address, erc20Abi, formatUnits, parseEther, parseUnits, PublicClient, WalletClient } from "viem";
import { mainnet } from "viem/chains";
import WarpRouteContract from "../abis/WarpRouteContract.json";
import { StepStatus } from "../components/MintTransactionDetails";
import { TokenOption } from "../components/TokenSelect";
import { hyperlaneIdForEclipse } from "../constants";
import { warpRouteContractAddress } from "../constants/contracts";
import { tEthTokenAddress, tokenAddresses, tokenOptions } from "../constants/tokens";
import { balanceOf } from "../lib/balanceOf";
import { getRateInQuote } from "../lib/getRateInQuote";
import { calculateMinimumMint } from "../utils/calculateMinimumMint";
import { getSolanaBalance } from "../utils/getSolanaBalance";
import { sanitizeInput } from "../utils/sanitizeInput";
import { MintTransactionDetails } from "./MintTransactionDetails";
import { MintValueCard } from "./MintValueCard";
import "./styles.css";

export enum Tabs {
  Mint,
  Redeem,
}

function Mint() {
  ///////////////////////
  // Hooks
  ///////////////////////
  const { walletConnector, accountSwitchState } = useDynamicContext();
  const { evmWallet, solWallet } = useWallets();
  const { rpcProviders } = useDynamicContext();

  ///////////////////////
  // State
  ///////////////////////
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositAsset, setDepositAsset] = useState<`0x${string}`>(tokenAddresses[0]);
  const [exchangeRate, setExchangeRate] = useState<string>("");
  const [depositPending, setDepositPending] = useState<boolean>(false);
  const [tokenBalanceAsBigInt, setTokenBalanceAsBigInt] = useState<bigint>(BigInt(0));
  const [loadingTokenBalance, setLoadingTokenBalance] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [approveStatus, setApproveStatus] = useState<StepStatus>(StepStatus.NOT_STARTED);
  const [depositStatus, setDepositStatus] = useState<StepStatus>(StepStatus.NOT_STARTED);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Mint);
  const [depositTxHash, setDepositTxHash] = useState<string>("");
  const [svmBalance, setSvmBalance] = useState<string>("");

  ///////////////////////
  // Derived values
  ///////////////////////
  const formattedTokenBalance = formatUnits(tokenBalanceAsBigInt, 18);
  const depositAmountAsBigInt = parseUnits(depositAmount, 18);
  const exchangeRateAsBigInt = BigInt(exchangeRate);
  const receiveAmountAsBigInt =
    exchangeRateAsBigInt > BigInt(0)
      ? (depositAmountAsBigInt * BigInt(1e18)) / exchangeRateAsBigInt
      : depositAmountAsBigInt;
  const formattedReceiveAmount = formatUnits(receiveAmountAsBigInt, 18);

  const isMintDisabled = depositPending || !depositAmount || !depositAsset || !evmWallet;

  const isOverBalance = tokenBalanceAsBigInt < depositAmountAsBigInt;

  const provider = rpcProviders.evmDefaultProvider;

  const evmAddress = evmWallet?.address as `0x${string}` | undefined;
  const svmAddress = solWallet?.address as `0x${string}` | undefined;

  // Memoized because it returns a new array on every render
  const steps = useMemo(() => {
    return [
      {
        title: "1. Approving",
        status: approveStatus,
      },
      {
        title: "2. Depositing",
        status: depositStatus,
        link: `https://etherscan.io/tx/${depositTxHash}`,
      },
    ];
  }, [approveStatus, depositStatus, depositTxHash]);

  // Memoized because it iterates over an array
  const { depositAssetLabel, depositAssetIcon } = useMemo(() => {
    const tokenOption = tokenOptions.find((token) => token.value === depositAsset);
    return { depositAssetLabel: tokenOption?.label, depositAssetIcon: tokenOption?.imageSrc };
  }, [depositAsset]);

  ///////////////////////
  // Use effects
  ///////////////////////

  // Set the balance of the SVM wallet
  useEffect(() => {
    async function getSvmBalance() {
      if (!svmAddress) return;
      const balance = await getSolanaBalance(svmAddress, tEthTokenAddress);
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

      // Only update if the asset hasn't changed
      if (!isCancelled && asset === depositAsset) {
        setExchangeRate(rate.toString());
      }
    }

    getExchangeRate(depositAsset);

    // Get an updated exchange rate every 30 seconds
    const intervalId = setInterval(() => {
      getExchangeRate(depositAsset);
    }, 30_000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [depositAsset, publicClient]);

  // Get the token balance
  useEffect(() => {
    async function getTokenBalance() {
      try {
        if (!publicClient || !evmWallet) return;
        setLoadingTokenBalance(true);
        const tokenBalanceAsBigInt = await balanceOf({
          tokenAddress: depositAsset,
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
  }, [depositAsset, evmWallet, publicClient]);

  ///////////////////
  // Actions
  ///////////////////
  async function handleMint() {
    if (isMintDisabled) return;

    if (!walletClient || !publicClient || !evmAddress || !svmAddress) {
      throw new Error("There was an error during deposit");
    }

    setIsModalOpen(true);

    const recipientBytes32 = solanaToBytes32(solWallet?.address || "");
    const [account] = await walletClient.getAddresses();

    const depositAmountAsBigInt = parseEther(depositAmount);

    ////////////////////////////////
    // Check Allowance
    ////////////////////////////////
    setApproveStatus(StepStatus.LOADING);
    const allowanceAsBigInt = await publicClient.readContract({
      abi: erc20Abi,
      address: depositAsset,
      functionName: "allowance",
      args: [evmAddress, warpRouteContractAddress],
    });

    ////////////////////////////////
    // Approve
    ////////////////////////////////
    try {
      if (depositAmountAsBigInt > allowanceAsBigInt) {
        // Simulate the transaction to catch any errors
        const { request: approvalRequest } = await publicClient.simulateContract({
          abi: erc20Abi,
          address: depositAsset,
          functionName: "approve",
          args: [warpRouteContractAddress, depositAmountAsBigInt],
          account: evmAddress,
        });

        // Execute the transaction
        const approvalTxHash = await walletClient.writeContract(approvalRequest);

        // Wait for the approval transaction to be confirmed
        await publicClient.waitForTransactionReceipt({
          hash: approvalTxHash,
          timeout: 60_000,
          confirmations: 1,
          pollingInterval: 10_000,
          retryCount: 5,
          retryDelay: 5_000,
        });
      }
      setApproveStatus(StepStatus.COMPLETED);
    } catch (error) {
      setApproveStatus(StepStatus.FAILED);
      console.error(error);
    }

    try {
      setDepositStatus(StepStatus.LOADING);
      ////////////////////////////////
      // Calculate Minimum Mint
      ////////////////////////////////
      const rate = await getRateInQuote({ quote: depositAsset }, { publicClient });
      const minimumMint = calculateMinimumMint(depositAmountAsBigInt, rate);

      ////////////////////////////////
      // Deposit
      ////////////////////////////////
      // Simulate the transaction to catch any errors
      const { request: depositRequest } = await publicClient.simulateContract({
        abi: WarpRouteContract.abi as Abi,
        address: warpRouteContractAddress,
        functionName: "depositAndBridge",
        args: [depositAsset, depositAmountAsBigInt, minimumMint, recipientBytes32],
        account: evmAddress,
      });

      // Execute the transaction
      const txHash = await walletClient.writeContract(depositRequest);

      if (!txHash) {
        setDepositStatus(StepStatus.FAILED);
        throw new Error("Failed to determine trasaction hash for the deposit");
      }

      setDepositTxHash(txHash);

      // Wait for the deposit transaction to be confirmed
      await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 60_000,
        confirmations: 1,
        pollingInterval: 10_000,
        retryCount: 5,
        retryDelay: 5_000,
      });
      setDepositStatus(StepStatus.COMPLETED);

      const txData = await generateTxObjectForDetails(provider ? provider.provider : publicClient, txHash);

      setCurrentTx(txData);
    } catch (error) {
      setDepositStatus(StepStatus.FAILED);
      console.error(error);
    }
  }

  function handleDepositAmountChange(val: string) {
    const sanitizedInput = sanitizeInput(val, depositAmount);
    setDepositAmount(sanitizedInput);
  }

  function handleDepositAssetChange(val: TokenOption) {
    setDepositAsset(val.value);
  }

  function closeModal() {
    setTimeout(() => {
      setIsModalOpen(false);
      setApproveStatus(StepStatus.NOT_STARTED);
      setDepositStatus(StepStatus.NOT_STARTED);
      setDepositAmount("");
      setDepositTxHash("");
      setCurrentTx(null);
    }, 100);
  }

  function handleClickMax() {
    setDepositAmount(formattedTokenBalance);
  }

  ///////////////////
  // Render
  ///////////////////
  return (
    <>
      <div className={isModalOpen ? "status-overlay active" : "status-overlay"}></div>
      <div>
        {isModalOpen && (
          <MintTransactionDetails
            fromDeposit={true}
            closeModal={closeModal}
            tx={currentTx}
            steps={steps}
            depositAmountAsBigInt={depositAmountAsBigInt}
            depositAssetLabel={depositAssetLabel}
            depositAssetIcon={depositAssetIcon}
          />
        )}
        <div className="deposit-container flex flex-col">
          <div className="deposit-card">
            <div className="header-tabs">
              <div
                className={classNames("header-tab", activeTab === Tabs.Mint ? "active" : "inactive")}
                style={{ width: "100%" }}
                onClick={() => setActiveTab(Tabs.Mint)}
              >
                Mint
              </div>
              <div
                className={classNames("header-tab", "disabled", activeTab === Tabs.Redeem ? "active" : "inactive")}
                style={{ width: "100%" }}
              >
                Redeem
              </div>
            </div>
            {activeTab === Tabs.Mint && (
              <div className="flex flex-col gap-3">
                <MintValueCard
                  title="Deposit from"
                  chainName="Ethereum"
                  chainIconImg="/eth.png"
                  userAddress={evmAddress}
                  inputValue={depositAmount}
                  loadingTokenBalance={loadingTokenBalance}
                  onChangeInput={handleDepositAmountChange}
                  depositAsset={tokenOptions.find((token) => token.value === depositAsset)}
                  onChangeDepositAsset={handleDepositAssetChange}
                  isOverBalance={isOverBalance}
                  tokenBalance={tokenBalanceAsBigInt}
                  onClickMax={handleClickMax}
                />
                <MintValueCard
                  title="Receive on"
                  chainName="Eclipse"
                  chainIconImg="/eclipse.png"
                  userAddress={svmAddress}
                  inputValue={formattedReceiveAmount}
                  disabled={true}
                  depositAsset={{
                    value: "0xtETH-solana",
                    label: "tETH",
                    imageSrc: "/token-teth.svg",
                  }}
                  tokenBalance={BigInt(svmBalance)}
                />
              </div>
            )}
            {activeTab === Tabs.Redeem && <div>Redeem</div>}
            <button
              className={classNames("mint-button mt-3", { "mint-button-disabled": isMintDisabled })}
              onClick={handleMint}
              disabled={isMintDisabled}
            >
              {depositPending ? "Minting..." : "Mint"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Mint;
