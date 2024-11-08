'use client';

import React, { useEffect, useState } from "react";


const CheckIcon: React.FC = () => {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 2.5C6.97715 2.5 2.5 6.97715 2.5 12.5C2.5 18.0228 6.97715 22.5 12.5 22.5C18.0228 22.5 22.5 18.0228 22.5 12.5C22.5 6.97715 18.0228 2.5 12.5 2.5ZM16.274 10.6333C16.6237 10.2058 16.5607 9.5758 16.1332 9.22607C15.7058 8.87635 15.0758 8.93935 14.726 9.36679L10.9258 14.0116L9.70711 12.7929C9.31658 12.4024 8.68342 12.4024 8.29289 12.7929C7.90237 13.1834 7.90237 13.8166 8.29289 14.2071L10.2929 16.2071C10.4927 16.4069 10.7676 16.5129 11.0498 16.4988C11.332 16.4847 11.595 16.3519 11.774 16.1333L16.274 10.6333Z" fill="#A1FEA0"/>
    </svg>
  );
}

export const TosClickwrap: React.FC = () => {
  const [isTosVisible, setIsTosVisible] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  useEffect(() => {
    const hasAcceptedToS = localStorage.getItem("tosAccepted");
    setIsTosVisible(!hasAcceptedToS); 
  }, []);

  const setTosAccepted = () => {
    localStorage.setItem("tosAccepted", "true");
    setIsTosVisible(false);
  };

  if (!isTosVisible) {
    return null;
  }

  return (
    <div className="
        fixed inset-0 flex items-center justify-center bg-black/50 
        backdrop-blur-[2px] z-50
    ">
      <div className="
            flex flex-col bg-[#000] 
            rounded-[30px] shadow-lg p-5 w-full max-w-md
            border-[1px] border-[#ffffff1a]
            gap-[52px] 
      ">
        <div className="
              flex flex-row justify-center items-center text-[#FFF] text-[20px] font-medium
              w-full
        ">
          <span>Terms of Service</span>
        </div>
        <div className="flex w-full flex-col items-center justify-center text-[16px] font-medium gap-[10px]">
          <img src="/tos-image.png" alt="Tos icon." className="w-[96px] h-[96px] rounded-[50%]"/>
          <p className="text-[#ffffff99] mb-6">By Continuing, you agree to:</p>
        </div>
        
        <div className="flex flex-col gap-[10px]">
          <div className="
              bg-[#a1fea00d] border-[#a1fea01a] border-[1px]
              rounded-[10px] items-center gap-[12px]
              py-[12px] px-[8px] flex flex-row
              float-left cursor-pointer
              hover:bg-[#a1fea011] transition-all
          " onClick={() => setIsChecked(!isChecked)}>
            <div className="flex ml-[2px] w-[25px] h-[25px] items-center" onClick={() => setIsChecked(!isChecked)}>
              { isChecked 
                  ? <CheckIcon />  
                  : <div className="
                      w-[22px] h-[22px] border-[1px] border-[#A1FEA0] rounded-[50%]
                      opacity-[15%] cursor-pointer">
                  </div> 
              }
            </div>
            <span className="
              text-[#a1fea099] text-[16px] font-medium
            ">I agree to Eclipse’s  
              <span> </span>
              <a className="text-[#A1FEA0] hover:text-[#a1fea0e6]" target="_blank" href="https://eclipse.xyz/terms">
                Terms of Service
              </a>
            </span>
          </div>
          <button className="
            bg-[#A1FEA0] text-black px-4 py-2 rounded-[10px] 
            font-medium h-[58px] w-full text-[20px]
            hover:bg-[#74FF71] transition
            disabled:bg-[#ffffff0d] disabled:text-[#ffffff4d]
            active:scale-95
            disabled:cursor-not-allowed disabled:active:scale-100
          " disabled={ !isChecked }
            onClick={ isChecked ? setTosAccepted : () => {}}
          > 
            Continue 
          </button>
        </div>
      </div>
    </div>
  );
};
