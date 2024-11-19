import { Cross, WalletIcon, CircleCheck } from "../icons";
import { useTransactionManager, Token } from "./TokenManager"
import { useSidebar } from "@/app/contexts/SidebarContext";


const TokenItem: React.FC<{ token: Token, selectedToken: Token, onClick: () => void}> = ({ token, selectedToken, onClick }) => {
  return (
    <div className="cursor-pointer flex flex-row justify-between w-full py-[12px] px-[14px] rounded-[10px] bg-[#ffffff0d] hover:bg-[#ffffff14]" onClick={onClick}>
      <div className="flex flex-row items-center">
        <img src={ token.icon } alt="" className="w-[33px] h-[33px]" />
        <div className="flex flex-col ml-[10px]">
          <span className="text-[14px] font-medium tracking-[-0.14px]">{ token.symbol }</span>
          <span className="text-[12px] font-medium tracking-[-0.12px] text-[#ffffff4d]">{ token.name }</span>
        </div>
      </div>

      <div className="flex flex-row items-center">
        <WalletIcon width="14" />
        <span className="text-[16px] font-medium text-[#ffffff4d] ml-[6px] mr-[12px]">{ (Number(token.balance ?? BigInt(0)) / 10 ** token.decimals).toFixed(4) }</span>
        { token.symbol === selectedToken.symbol 
          ? <CircleCheck circleClassName="" />
          : <div className="rounded-[50%] border-2 w-[18px] h-[18px] border-[#ffffff1a]"></div> 
        }
      </div>

    </div>
  );
}

export const SelectToken: React.FC<{ 
  setSelectModal: React.Dispatch<React.SetStateAction<boolean>>, 
  setSelectedToken: React.Dispatch<React.SetStateAction<Token>>, 
  selectedToken: Token 
}> = ({ setSelectModal, setSelectedToken, selectedToken }) => {
  const { tokens } = useTransactionManager(); 
  const { isSidebar } = useSidebar();

  return (
    <div className={`fixed top-0 left-0 w-screen h-screen backdrop-blur-[2px] flex justify-center items-center z-[999]`}>
      <div className={`flex flex-col absolute w-[375px] rounded-[30px] bg-black ${ isSidebar ? 'sm:ml-[212px]' : 'sm:ml-[70px]'}`} style={{ border: "1px solid rgba(255, 255, 255, 0.10)"}}>
        <div className="flex flex-row justify-between items-center p-[20px]">
          <span></span>
          <span className="font-medium text-[18px] tracking-[-0.18px]">Choose token to pay with</span>
          <div onClick={() => { setSelectModal(false) }}><Cross crossClassName="h-[10px] w-[10px] cursor-pointer" /></div>
        </div>
        <div className="flex flex-col p-[20px] gap-[8px]" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.10)"}}>
          {Object.keys(tokens).map((key) => {
              const token = tokens[key];
              return (
                <TokenItem
                  key={token.name}
                  token={token}
                  selectedToken={selectedToken}
                  onClick={() => { setSelectedToken(token); setSelectModal(false) }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}


export default SelectToken;
