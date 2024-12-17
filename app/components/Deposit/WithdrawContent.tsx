"use client";
import React, { useEffect, useState, useCallback } from "react";

import "./styles.css";
import "react-loading-skeleton/dist/skeleton.css";

import TransferArrow from "../icons/transferArrow";

import {
  DynamicConnectButton,
  useDynamicContext,
  useRpcProviders,
} from "@dynamic-labs/sdk-react-core";

import { mainnet, sepolia } from "viem/chains";
import {
  createPublicClient,
  formatEther,
  http,
  parseEther,
  WalletClient,
} from "viem";
import { Transport, Chain, Account } from "viem";
import { getBalance } from "viem/actions";

import { solanaToBytes32, getWalletBalance } from "@/lib/solanaUtils";
import { generateTxObjectForDetails } from "@/lib/activityUtils";

import Skeleton from "react-loading-skeleton";

import { TransactionDetails } from "../TransactionDetails";
import { useTransaction } from "../TransactionPool";
import { NetworkBox } from "./NetworkBox";
import { CONTRACT_ABI, MIN_DEPOSIT_AMOUNT } from "../constants";
import { useWallets } from "@/app/hooks/useWallets";
import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";

const client = createPublicClient({
  chain:
    process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet" ? mainnet : sepolia,
  transport:
    process.env.NEXT_PUBLIC_CURRENT_CHAIN === "mainnet"
      ? http("https://eth.llamarpc.com")
      : http("https://sepolia.drpc.org"),
  cacheTime: 0,
});

export interface WithdrawContentProps {
  modalStuff: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  amountEther: number | string | undefined;
  setAmountEther: React.Dispatch<
    React.SetStateAction<number | undefined | string>
  >;
}

export const WithdrawContent: React.FC<WithdrawContentProps> = ({
  modalStuff,
  amountEther,
  setAmountEther,
}) => {
  const [walletClient, setWalletClient] = useState<WalletClient<
    Transport,
    Chain,
    Account
  > | null>(null);
  const [ethTxStatus, setEthTxStatus] = useState("");
  const [balanceEther, setAmountBalanceEther] = useState<number>(-1);
  const [isEvmDisconnected, setIsEvmDisconnected] = useState(false);
  const [isSolDisconnected, setIsSolDisconnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = modalStuff;
  const [currentTx, setCurrentTx] = useState<any>(null);

  const evmRpcProvider = useRpcProviders(evmProvidersSelector);
  const { handleUnlinkWallet } = useDynamicContext();
  const { addNewDeposit } = useTransaction();

  const { userWallets, evmWallet, solWallet } = useWallets();
  const provider = evmRpcProvider.defaultProvider;

  useEffect(() => {
    let lWalletClient =
      //@ts-ignore
      evmWallet?.connector.getWalletClient<
        WalletClient<Transport, Chain, Account>
      >();
    lWalletClient && (lWalletClient.cacheTime = 0);
    setWalletClient(lWalletClient ?? null);
  }, [evmWallet?.connector]);

  const setInputRef = useCallback((node: HTMLInputElement) => {
    if (node) {
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
      };
      node.addEventListener("wheel", handleWheel);
      return () => {
        node.removeEventListener("wheel", handleWheel);
      };
    }
  }, []);

  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;
      // const balance = await getWalletBalance(solWallet?.address || "");
      const balance = 150000;

      const balanceAsEther = formatEther(BigInt(balance * 10 ** 18));
      const formattedEtherBalance = balanceAsEther.includes(".")
        ? balanceAsEther.slice(0, balanceAsEther.indexOf(".") + 5)
        : balanceAsEther;
      const balanceEther = parseFloat(formattedEtherBalance);
      setAmountBalanceEther(balanceEther);
    });
  }, [userWallets]);

  const submitWithdraw = async () => {
    setIsModalOpen(true);
    setEthTxStatus("Continue in your wallet");
    const destinationBytes32 = solanaToBytes32(solWallet?.address || "");
    const [account] = await walletClient!.getAddresses();
    const weiValue = parseEther(amountEther?.toString() || "");

    try {
      // doooooo something here

      setEthTxStatus("Confirming");
      const txData = null;

      setAmountEther("");
      addNewDeposit(txData);
      setCurrentTx(txData);
    } catch (error) {
      setIsModalOpen(false);
      console.error("Failed to deposit", error);
    }
  };

  function determineInputClass(): string {
    if (!evmWallet || !solWallet) return "disabled";
    if (parseFloat(amountEther as string) > balanceEther) {
      return "alarm";
    }
    return "";
  }

  function determineButtonClass(): string {
    if (!evmWallet || !solWallet) {
      return "submit-button disabled";
    }
    if (!amountEther) {
      return "submit-button disabled";
    }
    if (parseFloat(amountEther as string) < MIN_DEPOSIT_AMOUNT) {
      return "submit-button disabled";
    }

    if (parseFloat(amountEther as string) > balanceEther) {
      return "submit-button alarm";
    }
    return "submit-button";
  }

  function determineButtonText(): string {
    if (!evmWallet && solWallet) {
      return "Connect Ethereum Wallet";
    }
    if (evmWallet && !solWallet) {
      return "Connect Eclipse Wallet";
    }
    if (!evmWallet && !solWallet) {
      return "Connect Wallets";
    }
    if (!amountEther) {
      return "Withdraw";
    }
    if (parseFloat(amountEther as string) < MIN_DEPOSIT_AMOUNT) {
      return `Min amount ${MIN_DEPOSIT_AMOUNT} ETH`;
    }

    if (parseFloat(amountEther as string) > balanceEther) {
      return "Insufficient Funds";
    }

    return "Withdraw";
  }

  return (
    <>
      <div
        className={isModalOpen ? "status-overlay active" : "status-overlay"}
      ></div>
      {!isModalOpen && (
        <div>
          <div className="network-section">
            <div className="arrow-container">
              <TransferArrow />
            </div>
          </div>
          <div
            className={`amount-input flex flex-col ${determineInputClass()}`}
          >
            <div className="amount-input-top flex justify-between w-full items-center">
              <div className="input-wrapper">
                {!evmWallet || (evmWallet && balanceEther >= 0) ? (
                  <input
                    disabled={!evmWallet || !solWallet}
                    step="0.01"
                    min="0"
                    placeholder="0 ETH"
                    style={{ fontWeight: "500" }}
                    value={amountEther}
                    ref={setInputRef}
                    onChange={(e) => {
                      const value = e.target.value;
                      // don't allow string
                      if (
                        /^[-+]?(\d+([.,]\d*)?|[.,]\d+)$/.test(value) ||
                        value === ""
                      ) {
                        const [_, dp] = value.split(".");
                        if (!dp || dp.length <= 9) {
                          setAmountEther(value);
                        }
                      }
                    }}
                  />
                ) : (
                  <Skeleton height={40} width={160} />
                )}
              </div>
              <div className="token-display" style={{ width: "45%" }}>
                <div className="token-icon">
                  <img src="eth.png" alt="ETH Icon" />
                </div>
                <div className="token-name">ETH</div>
              </div>
            </div>
            <div
              className={`${evmWallet ? "" : "hidden"} amount-input-bottom flex flex-row justify-between w-full items-center`}
            >
              {solWallet && (
                <div className="balance-info w-full">
                  <span>Bal</span>
                  {balanceEther >= 0 ? (
                    <>
                      <span style={{ color: "#fff" }}>
                        {balanceEther + " "}{" "}
                      </span>{" "}
                      <>ETH</>
                    </>
                  ) : (
                    <span style={{ width: "20%" }}>
                      <Skeleton inline={true} />
                    </span>
                  )}
                </div>
              )}
              <div className={solWallet ? "percentage-buttons" : "invisible"}>
                <button
                  onClick={() => setAmountEther(balanceEther * 0.25)}
                  className="percentage-button"
                >
                  25%
                </button>
                <button
                  onClick={() => setAmountEther(balanceEther * 0.5)}
                  className="percentage-button"
                >
                  50%
                </button>
                <button
                  onClick={() => setAmountEther(balanceEther)}
                  className="percentage-button"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
          {!evmWallet || !solWallet ? (
            <DynamicConnectButton
              buttonClassName="wallet-connect-button w-full"
              buttonContainerClassName="submit-button connect-btn"
            >
              <span style={{ width: "100%" }}> {determineButtonText()}</span>
            </DynamicConnectButton>
          ) : (
            <button
              className={`w-full deposit-button p-4 ${determineButtonClass()}`}
              onClick={submitWithdraw}
            >
              {determineButtonText()}
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <TransactionDetails
          ethStatus={ethTxStatus}
          from={"withdraw"}
          tx={currentTx}
          closeModal={() => {
            setTimeout(() => {
              setIsModalOpen(false), setCurrentTx(null);
            }, 100);
          }}
        />
      )}
    </>
  );
};
