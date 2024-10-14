import { useState, useRef, useEffect } from "react";
import { Chevron, GasStationIcon, WalletIcon } from "../icons";
import { useTransactionManager, Token } from "./TokenManager";
import { Transaction, Signer, Keypair, VersionedTransaction, TransactionMessage, PublicKey } from '@solana/web3.js';
import { SelectToken} from "./SelectToken"
import { useWallets } from "@/app/hooks/useWallets";
import { createOctaneSwapTransaction, sendOctaneSwapTransaction } from "@/lib/octaneUtils"
import { IBackpackSolanaSigner, ISolana } from '@dynamic-labs/solana';
const bs58 = require('bs58');


export const GasStation: React.FC = () => {
  const { tokens } = useTransactionManager(); 
  const [selectedToken, setSelectedToken] = useState<Token>(tokens.USDC);
  const [selectModal, setSelectModal] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("0");
  const { solWallet } = useWallets(); 

  const moveCursorToEnd = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    const length = input.value.length;
    input.setSelectionRange(length, length); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value); 
    e.target.style.width = (value.length) + "ch";
  };

  const fetchOctane = async () => {
    // create transaction
    const octaneData = await createOctaneSwapTransaction(
      solWallet?.address || "",
      selectedToken.mint,
      Number(amount) * (10 ** selectedToken.decimals) / (selectedToken.price ?? 1)
    );
    // get message token to prove that you didn't changed the transaction 
    const messageToken = octaneData.messageToken;

    // deserialize transaction
    const tx = Transaction.from(bs58.decode(octaneData.transaction));

    // sign transaction with keypair
    // tx.partialSign(Keypair.fromSeed(bs58.decode("privatekey")))

    //get signer
    const cli = await solWallet?.connector.getSigner<ISolana>();

    // sign transactio/* BUG */
    // remove this line when you signing with keypair
    const signedTx = await cli?.signTransaction(tx);

    // serialize transaction
    const encodedTx = bs58.encode(signedTx?.serialize({ verifySignatures: false }));
    console.log(encodedTx)

    // send transaction to octane 
    const txHash = await sendOctaneSwapTransaction(encodedTx, messageToken);
    console.log(txHash)

  }

  useEffect(() => {
    setSelectedToken(tokens[selectedToken.symbol])
  }, [tokens])

  return (
    <div className="flex flex-col rounded-[30px] w-[520px] p-[20px] gap-[20px]" style={{ border: "1px solid rgba(255, 255, 255, 0.10)" }}>
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
        <div className="flex flex-col border-t-[1px] border-t-[#ffffff1a] items-center h-[80%]">
          <div className="flex flex-col items-center mt-auto w-full" onClick={() => inputRef?.current?.focus()}>
            <div className="flex flex-row items-center">
              <span className={`font-semibold text-[44px] ${amount.includes('.') ? "mr-[-7px]" : ""}`}>$</span>
              <input type="string" 
                     className="bg-transparent font-semibold text-[44px] text-center w-[1ch]" 
                     value={amount} 
                     onChange={handleChange}
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
              <span className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer">$5</span>
              <span className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer">$10</span>
              <span className="text-[#a1fea04d] font-medium hover:text-[#a1fea099] cursor-pointer">$20</span>
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
          <span className="text-[#ffffff4d] font-medium text-[14px]">$0</span>
        </div>

        <div className="flex gap-2">
          <span className="text-[#ffffff99] font-medium text-[14px]">Cost</span>
          <span className="text-[#ffffff4d] font-medium text-[14px]">$0</span>
        </div>
      </div>

      { /* button */ }
      <button className="w-full h-[58px] bg-[#ffffff0d] rounded-[10px]" onClick={fetchOctane}>
       <span className="font-medium text-[20px] text-[#ffffff4d]">Get Gas</span> 
      </button>
      
      { /* select token modal */ }
      { selectModal && setSelectModal && 
          <SelectToken setSelectModal={setSelectModal} 
                       selectedToken={selectedToken} 
                       setSelectedToken={setSelectedToken}/> }
    </div>
  )
}
