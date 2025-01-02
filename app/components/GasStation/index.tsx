import { useState, useRef, useEffect } from "react";
import { Chevron, GasStationIcon, WalletIcon, CircleInfo } from "../icons";
import { useTransactionManager, Token } from "./TokenManager";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { Transaction, Connection } from "@solana/web3.js";
import { SelectToken } from "./SelectToken";
import { GasStationNotification, TxStatus } from "./Notification";
import { useWallets } from "@/app/hooks/useWallets";
import { createOctaneSwapTransaction } from "@/lib/octaneUtils";
import { SolanaWalletConnector } from "@dynamic-labs/solana";
import { BridgeRedirectionComponent } from "./BridgeRedirectionComponent";
import { useAboutGasStationModal } from "@/app/hooks/useAboutGasStationModal";
const bs58 = require("bs58");

/*
 * if amount > balance = insufficient funds
 */

export const GasStation: React.FC = () => {
  const { tokens } = useTransactionManager();
  const [selectedToken, setSelectedToken] = useState<Token>(tokens.SOL);
  const {
    open: openPopup,
    close: closePopup,
    renderModal,
    isOpen: isAboutModalOpen,
  } = useAboutGasStationModal();
  const [selectModal, setSelectModal] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("0");
  const [txState, setTxState] = useState("");
  const [txId, setTxId] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.None);
  const { solWallet } = useWallets();
  function userHaveEnoughFunds(): boolean {
    return !(
      BigInt(Number(amount ?? "0") * 10 ** selectedToken.decimals) /
        BigInt(Math.floor(selectedToken.price ?? 0)) >
      (selectedToken.balance ?? BigInt(0))
    );
  }

  function getInputClassName(): string {
    // insufficient funds
    if (!userHaveEnoughFunds()) {
      return "flex flex-col border-[1px] border-[#eb4d4d80] items-center h-[235px] bg-[#eb4d4d08] rounded-b-[10px]";
    }

    return "flex flex-col border-transparent border-[1px] border-t-[#ffffff1a] rounded-b-[10px] items-center h-[235px]";
  }

  function getButtonText(): string {
    // wallet not connected
    if (!solWallet) {
      return "Connect Wallet";
    }

    // insufficient funds
    if (
      BigInt(Number(amount ?? "0") * 10 ** selectedToken.decimals) /
        BigInt(Math.floor(selectedToken.price ?? 0)) >
      (selectedToken.balance ?? BigInt(0))
    ) {
      return "Insufficient Balance";
    }

    return "Get Gas";
  }

  function getButtonClassName(): string {
    // wallet not connected
    if (!solWallet) {
      return "w-full h-[62px] bg-[#A1FEA0] rounded-[10px] text-black text-[20px] font-medium";
    }

    // insufficient funds
    if (
      BigInt(Number(amount ?? "0") * 10 ** selectedToken.decimals) /
        BigInt(Math.floor(selectedToken.price ?? 0)) >
      (selectedToken.balance ?? BigInt(0))
    ) {
      return "w-full h-[58px] bg-[#ffffff0d] rounded-[10px] text-[#EB4D4D] bg-[#eb4d4d1a] text-[20px] font-medium pointer-events-none";
    }

    // amount is empty or have an active transaction or about modal is open
    if (
      amount === "" ||
      Number(amount) === 0 ||
      txStatus === TxStatus.Waiting ||
      isAboutModalOpen
    ) {
      return "w-full h-[58px] bg-[#ffffff0d] rounded-[10px] text-[#ffffff4d] text-[20px] font-medium pointer-events-none";
    }

    return "w-full h-[58px] bg-[#A1FEA0] rounded-[10px] text-black text-[20px] transition-all active:scale-95 font-medium hover:bg-[#74FF71]";
  }

  const moveCursorToEnd = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    const length = input.value.length;
    input.setSelectionRange(length, length);
  };

  function emitEvent(name: string, status: TxStatus, timeoutSec: number) {
    setTxState(name);
    setTxStatus(status);

    setTimeout(() => {
      setTxState("");
      setTxId("");
    }, timeoutSec * 1000);
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = amount.length + "ch";
    }
  }, [amount]);

  const fetchOctane = async () => {
    // create transaction
    const connection = new Connection("https://eclipse.helius-rpc.com");
    setTxState("Fetching transaction...");
    setTxStatus(TxStatus.Waiting);
    const octaneData = await createOctaneSwapTransaction(
      solWallet?.address || "",
      selectedToken.mint,
      (Number(amount) * 10 ** selectedToken.decimals) /
        (selectedToken.price ?? 1),
    );

    if (!octaneData || octaneData.status === "error") {
      emitEvent(`Failed to fetch transaction.`, TxStatus.Failed, 5);
      return -1;
    }

    setTxState("Continue in your wallet...");
    // deserialize transaction
    const tx = Transaction.from(bs58.decode(octaneData.transaction));
    console.log(tx);

    const cli = await (
      solWallet?.connector as SolanaWalletConnector
    ).getSigner();

    if (!cli) {
      return 1;
    }
    let signedTransaction = null;

    try {
      signedTransaction = await cli?.signAndSendTransaction(tx);
      console.log(signedTransaction);
    } catch {
      emitEvent(`Refueling for $${amount} is failed.`, TxStatus.Failed, 5);
      return -1;
    }

    setTxState(`Refueling for $${amount} ...`);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signedTransaction.signature,
      },
      "confirmed",
    );

    emitEvent(`$${amount} refuel was successful.`, TxStatus.Confirmed, 10);
    setTxId(signedTransaction.signature);

    console.log(signedTransaction.signature);
  };

  useEffect(() => {
    const token = tokens[selectedToken.symbol];
    setSelectedToken(token);
  }, [tokens]);

  return (
    <>
      {txState && (
        <GasStationNotification
          txState={txState}
          txStatus={txStatus}
          txId={txId}
        />
      )}
      <div
        className="deposit-container flex flex-col rounded-[30px] !w-[520px] p-[20px] gap-[20px]"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.10)",
          background: "rgba(255, 255, 255, 0.02)",
          transition: "transform 0.3s var(--ease-out-quad)",
        }}
      >
        {/* header text */}
        <div className="flex flex-row w-full justify-between items-center gap-[8px]">
          <div></div>
          <div className="flex flex-row items-center gap-2">
            <GasStationIcon size="19" stroke="#a1fea0" opacity="1" />
            <span className="font-medium text-[16px]">Gas Station</span>
          </div>
          <div
            className="transition-all cursor-pointer i-icon"
            onClick={openPopup}
          >
            <CircleInfo className="transition-all" />
          </div>
        </div>

        {/* main content */}
        <div className="w-full rounded-[10px] h-[292px] bg-[#ffffff08] border-[1px] border-[#ffffff1a]">
          {/* amount input */}
          <div className="flex flex-row py-[12px] px-[16px] justify-center items-center gap-[10px]">
            <span className="font-medium text-[#ffffff4d]">Pay with</span>
            <div
              className="flex flex-row rounded-[50px] bg-[#ffffff08] h-[33px] w-auto items-center p-[6px] cursor-pointer"
              onClick={() => setSelectModal(true)}
            >
              <img src={selectedToken.icon} width={"21px"} />
              <span className="font-medium text-[16px] ml-[9px] mr-[4px]">
                {selectedToken.symbol}
              </span>
              <Chevron size="18" />
            </div>
            <span className="font-medium text-[#ffffff4d]">on Eclipse</span>
          </div>
          <div
            className={getInputClassName()}
            style={{
              transition:
                "border-color 0.3s var(--ease-out-quad), background-color 0.3s var(--ease-out-quad)",
            }}
          >
            <div
              className="flex flex-col items-center mt-auto w-full"
              onClick={() => inputRef?.current?.focus()}
            >
              <div className="flex flex-row items-center">
                <span
                  className={`font-semibold text-[44px] ${amount.includes(".") ? "mr-[-7px]" : ""}`}
                >
                  $
                </span>
                <input
                  type="string"
                  className="bg-transparent font-medium text-[44px] text-center w-[1ch]"
                  value={amount}
                  onChange={() => {
                    setAmount(inputRef.current?.value || "");
                  }}
                  ref={inputRef}
                  onFocus={moveCursorToEnd}
                />
              </div>
              <span className="text-[18px] font-medium text-[#ffffff4d]">
                {(Number(amount) / (selectedToken.price ?? 1)).toFixed(4)}{" "}
                {selectedToken.symbol}
              </span>
            </div>
            {/* balance - percentage things */}
            <div className="flex flex-row items-center mt-[58px] mb-[15.5px]">
              <div className="flex flex-row items-center gap-[6px]">
                <WalletIcon width="14" />
                <span className="text-[#ffffff4d] text-[16px] font-medium">
                  $
                  {(
                    (Number(selectedToken.balance ?? 0) /
                      10 ** selectedToken.decimals) *
                    (selectedToken.price ?? 0)
                  ).toFixed(4)}
                </span>
              </div>
              <div className="flex gap-[22px] ml-[22px]">
                <span className="text-[#ffffff4d]">•</span>
                <span
                  className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer"
                  onClick={() => {
                    setAmount("5");
                  }}
                >
                  $5
                </span>
                <span
                  className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer"
                  onClick={() => {
                    setAmount("10");
                  }}
                >
                  $10
                </span>
                <span
                  className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer"
                  onClick={() => {
                    setAmount("20");
                  }}
                >
                  $20
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* tx info  */}

        <div
          className="flex flex-row justify-between w-full py-[8px] px-[16px] h-[36px] bg-[#0D0D0D] rounded-[10px]"
          style={{ border: "1px solid rgba(255, 255, 255, 0.10)" }}
        >
          <div className="flex gap-2">
            <span className="text-[#ffffff99] font-medium text-[14px]">
              Cost
            </span>
            {amount && parseFloat(amount) > 0 ? (
              <span className="text-[#A1FEA0] font-medium text-[14px]">
                $
                {(
                  (selectedToken.price ?? 1) *
                  (Number(selectedToken.fee) / 10 ** selectedToken.decimals)
                ).toFixed(5)}
              </span>
            ) : (
              <span className="text-[#ffffff4d] font-medium text-[14px]">
                $0
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <span className="text-[#ffffff99] font-medium text-[14px]">
              You Receive
            </span>
            {amount && parseFloat(amount) > 0 ? (
              <span className="text-[#A1FEA0] font-medium text-[14px]">
                ${amount}
              </span>
            ) : (
              <span className="text-[#ffffff4d] font-medium text-[14px]">
                $0
              </span>
            )}
          </div>
        </div>

        {/* button */}
        {!solWallet ? (
          <DynamicConnectButton
            buttonClassName={`${getButtonClassName()} ${selectModal ? "bg-[#ffffff0d] text-white" : ""}`}
            buttonContainerClassName="!mt-[0px] submit-button connect-btn"
          >
            <span className="w-full"> {getButtonText()}</span>
          </DynamicConnectButton>
        ) : (
          <button
            className={`${getButtonClassName()} ${selectModal ? "bg-[#ffffff0d] text-white" : ""}`}
            onClick={fetchOctane}
          >
            {getButtonText()}
          </button>
        )}

        {/* select token modal */}
        {selectModal && setSelectModal && (
          <SelectToken
            setSelectModal={setSelectModal}
            selectedToken={selectedToken}
            setSelectedToken={setSelectedToken}
          />
        )}
        {renderModal}
      </div>
      {!userHaveEnoughFunds() && solWallet && (
        <BridgeRedirectionComponent token={selectedToken.symbol} />
      )}
    </>
  );
};
