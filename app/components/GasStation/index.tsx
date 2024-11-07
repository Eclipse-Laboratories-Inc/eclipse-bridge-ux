import { useState, useRef, useEffect } from "react";
import { Chevron, GasStationIcon, WalletIcon } from "../icons";
import { useTransactionManager, Token } from "./TokenManager";
import {
  DynamicConnectButton,
} from "@dynamic-labs/sdk-react-core";
import { Transaction, Signer, Keypair, VersionedTransaction, TransactionMessage, PublicKey, Connection } from '@solana/web3.js';
import { SelectToken} from "./SelectToken"
import { GasStationNotification, TxStatus } from "./Notification"
import { useWallets } from "@/app/hooks/useWallets";
import { createOctaneSwapTransaction } from "@/lib/octaneUtils"
import { ISolana } from '@dynamic-labs/solana';
const bs58 = require('bs58');

/*
 * if amount > balance = insufficient funds
*/

export const GasStation: React.FC = () => {
  const { tokens } = useTransactionManager(); 
  const [selectedToken, setSelectedToken] = useState<Token>(tokens.USDC);
  const [selectModal, setSelectModal] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("0");
  const [txState, setTxState] = useState("");
  const [txId, setTxId] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.None);
  const { solWallet } = useWallets(); 
  useEffect(() => {
    console.log(selectedToken, "selo")
  }, [!selectedToken])

  function getInputClassName(): string {
    // insufficient funds
    if (BigInt(Number(amount ?? "0") * (10 ** selectedToken.decimals)) / BigInt(Math.floor(selectedToken.price ?? 0))> (selectedToken.balance ?? BigInt(0))) {
      return "flex flex-col border-[1px] border-[#eb4d4d80] items-center h-[235px] bg-[#eb4d4d08] rounded-b-[10px]"
    }

    return "flex flex-col border-transparent border-[1px] border-t-[#ffffff1a] rounded-b-[10px] items-center h-[235px]"
  }

  function getButtonText(): string {
    // wallet not connected
    if (!solWallet) {
      return "Connect Wallet"
    }
    
    // insufficient funds
    if (BigInt(Number(amount ?? "0") * (10 ** selectedToken.decimals)) / BigInt(Math.floor(selectedToken.price ?? 0))> (selectedToken.balance ?? BigInt(0))) {
      return "Insufficient Balance"
    }

    return "Gas Gas"
  }

  function getButtonClassName(): string {
    // wallet not connected
    if (!solWallet) {
      return "w-full h-[62px] bg-[#A1FEA0] rounded-[10px] text-black text-[20px] font-medium"
    }

    // insufficient funds
    if (BigInt(Number(amount ?? "0") * (10 ** selectedToken.decimals)) / BigInt(Math.floor(selectedToken.price ?? 0))> (selectedToken.balance ?? BigInt(0))) {
      return "w-full h-[58px] bg-[#ffffff0d] rounded-[10px] text-[#EB4D4D] bg-[#eb4d4d1a] text-[20px] font-medium pointer-events-none"
    }

    // amount is empty
    if (amount === "" || Number(amount) === 0) {
      return "w-full h-[58px] bg-[#ffffff0d] rounded-[10px] text-[#ffffff4d] text-[20px] font-medium pointer-events-none"
    }

    return "w-full h-[58px] bg-[#A1FEA0] rounded-[10px] text-black text-[20px] transition-all active:scale-95 font-medium hover:bg-[#74FF71]"
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
      setTxId("")
    }, timeoutSec * 1000)
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = (amount.length) + "ch";    
    }
  }, [amount])

  const fetchOctane = async () => {
    // create transaction
    const connection = new Connection("https://eclipse.helius-rpc.com"); 
    setTxState("Fetching transaction...");
    setTxStatus(TxStatus.Waiting)
    const octaneData = await createOctaneSwapTransaction(
      solWallet?.address || "",
      selectedToken.mint,
      Number(amount) * (10 ** selectedToken.decimals) / (selectedToken.price ?? 1)
    );
    setTxState("Continue in your wallet...");
    // deserialize transaction
    const tx = Transaction.from(bs58.decode(octaneData.transaction));
    console.log(tx)

    const cli = await solWallet?.connector.getSigner<ISolana>();
    
    if (!cli) { return 1; }
    let signedTransaction = null;

    try {
      // signedTransaction = await cli?.signTransaction(tx);
      signedTransaction = await cli?.signAndSendTransaction(tx);
      console.log(signedTransaction)
    } catch {
      emitEvent(`Refueling for $${amount} is failed.`, TxStatus.Failed, 5)
      return 1;
    } 

    setTxState(`Refueling for $${amount} ...`);
    const latestBlockHash = await connection.getLatestBlockhash();
    /*
    const rawTransaction = signedTransaction?.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 10,
    });
    */

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signedTransaction.signature
    }, 'confirmed');

    emitEvent(`Refuel of $${amount} Success`, TxStatus.Confirmed, 10)
    setTxId(signedTransaction.signature)
    // window.open(`https://solscan.io/tx/${txid}`)
    console.log(tx)
    console.log(signedTransaction.signature)
  }

  useEffect(() => {
    const token = tokens[selectedToken.symbol]; 
    setSelectedToken(token)
  }, [tokens])

  return (
    <>
    { txState && <GasStationNotification 
      txState={txState}
      txStatus={txStatus}
      txId={txId}
    /> }
    <div className="deposit-container flex flex-col rounded-[30px] !w-[520px] p-[20px] gap-[20px]" 
         style={{ border: "1px solid rgba(255, 255, 255, 0.10)", background: "rgba(255, 255, 255, 0.02)" }}>
      { /* header text */ }
      <div className="flex flex-row w-full justify-center items-center gap-[8px]">
        <GasStationIcon size="19" stroke="#a1fea0" opacity="1"/>
        <span className="font-medium text-[16px]">Gas Station</span>
      </div>

      { /* main content */ }
      <div className="w-full rounded-[10px] h-[292px] bg-[#ffffff08] border-[1px] border-[#ffffff1a]">
        { /* amount input */ }
        <div className="flex flex-row py-[12px] px-[16px] justify-center items-center gap-[10px]"
             onClick={() => setSelectModal(true) } >
            <span className="font-medium text-[#ffffff4d]">Pay with</span>
            <div className="flex flex-row rounded-[50px] bg-[#ffffff08] h-[33px] w-auto items-center p-[6px] cursor-pointer">
              <img src={selectedToken.icon} width={"21px"}/> 
              <span className="font-medium text-[16px] ml-[9px] mr-[4px]">{selectedToken.symbol}</span>
              <Chevron size="18" />
            </div>
        </div>
        <div className={getInputClassName()} 
             style={{ transition: "border-color 0.3s var(--ease-out-quad), background-color 0.3s var(--ease-out-quad)"}}
        >
          <div className="flex flex-col items-center mt-auto w-full" onClick={() => inputRef?.current?.focus()}>
            <div className="flex flex-row items-center">
              <span className={`font-semibold text-[44px] ${amount.includes('.') ? "mr-[-7px]" : ""}`}>$</span>
              <input type="string" 
                     className="bg-transparent font-semibold text-[44px] text-center w-[1ch]" 
                     value={amount} 
                     onChange={() => {setAmount(inputRef.current?.value || "")}}
                     ref={inputRef}
                     onFocus={moveCursorToEnd}
              />
            </div>
            <span className="text-[18px] font-medium text-[#ffffff4d]">
              { (Number(amount) / (selectedToken.price ?? 1)).toFixed(4) } {selectedToken.symbol}
            </span>
          </div>
          { /* balance - percentage things */ }
          <div className="flex flex-row items-center mt-[58px] mb-[15.5px]">
            <div className="flex flex-row items-center gap-[6px]">
              <WalletIcon width="14" />
              <span className="text-[#ffffff4d] text-[16px] font-medium">${(Number((selectedToken.balance ?? 0)) / (10 ** selectedToken.decimals) * (selectedToken.price ?? 0)).toFixed(4)}</span>
            </div>
            <div className="flex gap-[22px] ml-[22px]">
              <span className="text-[#ffffff4d]">•</span>
              <span className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer" onClick={() => {setAmount("5")}}>$5</span>
              <span className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer" onClick={() => {setAmount("10")}}>$10</span>
              <span className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer" onClick={() => {setAmount("20")}}>$20</span>
            </div>
          </div>
        </div>
      </div>

      { /* tx info  */ }

      <div className="flex flex-row justify-between w-full py-[8px] px-[16px] h-[36px] bg-[#0D0D0D] rounded-[10px]" 
           style={{ border: "1px solid rgba(255, 255, 255, 0.10)" }}
      >
        <div className="flex gap-2">
          <span className="text-[#ffffff99] font-medium text-[14px]">You Receive</span>

          { amount && parseFloat(amount) > 0 
            ? <span className="text-[#A1FEA0] font-medium text-[14px]">
                ${amount}
              </span>
            : <span className="text-[#ffffff4d] font-medium text-[14px]">$0</span>
          }
        </div>

        <div className="flex gap-2">
          <span className="text-[#ffffff99] font-medium text-[14px]">Cost</span>
          { amount && parseFloat(amount) > 0 
            ? <span className="text-[#A1FEA0] font-medium text-[14px]">
                ${ (selectedToken.price ?? 1) * (Number(selectedToken.fee) / 10 ** selectedToken.decimals) }
              </span>
            : <span className="text-[#ffffff4d] font-medium text-[14px]">$0</span> 
          }
        </div>
      </div>

      { /* button */ }
      { !solWallet 
        ? <DynamicConnectButton buttonClassName={getButtonClassName()} buttonContainerClassName="submit-button connect-btn">
            <span style={{ width: '100%' }}> { getButtonText() }</span>
          </DynamicConnectButton>

        : <button className={getButtonClassName()} onClick={fetchOctane}>
            { getButtonText() }
          </button>
      }
      
      { /* select token modal */ }
      { selectModal && setSelectModal && 
          <SelectToken setSelectModal={setSelectModal} 
                       selectedToken={selectedToken} 
                       setSelectedToken={setSelectedToken}/> }
    </div>
  </>
  )
}
