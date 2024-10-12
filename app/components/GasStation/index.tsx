import { useState, useRef } from "react";
import { Chevron, GasStationIcon, WalletIcon } from "../icons";

type Token = {
  icon: string,
  name: "USDC" | "SOL"
}

const tokens: Record<string, Token> = {
  USDC: { name: 'USDC', icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694' },
  SOL: { name: 'SOL', icon: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756' },
};

export const GasStation: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<Token>(tokens.USDC);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("0");


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value); 
    e.target.style.width = (value.length) + "ch";

  };

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
        <div className="flex flex-row py-[12px] px-[16px] justify-center items-center gap-[10px]">
            <span className="font-medium text-[#ffffff4d]">Pay with</span>
            <div className="flex flex-row rounded-[50px] bg-[#ffffff08] h-[33px] w-[106px] items-center p-[6px] cursor-pointer">
              <img src={selectedToken.icon} width={"21px"}/> 
              <span className="font-medium text-[16px] ml-[9px] mr-[4px]">{selectedToken.name}</span>
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
              />
            </div>
            <span className="text-[18px] font-medium text-[#ffffff4d]">{amount} {selectedToken.name}</span>
          </div>
          { /* balance - percentage things */ }
          <div className="flex flex-row items-center mt-[58px] mb-[15.5px]">
            <div className="flex flex-row items-center gap-[6px]">
              <WalletIcon width="14" />
              <span className="text-[#ffffff4d] text-[16px] font-medium">$150.47</span>
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
      <button className="w-full h-[58px] bg-[#ffffff0d] rounded-[10px]">
       <span className="font-medium text-[20px] text-[#ffffff4d]">Get Gas</span> 
      </button>
    </div>
  )
}
