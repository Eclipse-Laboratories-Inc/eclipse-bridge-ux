'use client';

import React from "react";
import { SquareArrowTopRight } from "../icons"

export interface ThirdpartyBridge {
  name: string,
  address: string,
  iconAddr: string
}

export const ThirdpartyBridgeItem: React.FC<{ thirdpartyBridge: ThirdpartyBridge}> = ({ 
  thirdpartyBridge
}) => {
  return (
  <a href={`https://${thirdpartyBridge.address}`} target="_blank">
    <div className="
          flex flex-row bg-[#FFFFFF0D] rounded-[10px]
          py-[12px] px-[14px] items-center
          justify-between w-[335px]
          hover:bg-[#ffffff12] transition-all
          h-[60px]
    ">
      <div className="flex flex-row gap-[10px] items-center">
        <img src={thirdpartyBridge.iconAddr} className="w-[33px] h-[33px]" />
        <div className="flex flex-col">
          <span className="text-white font-medium tracking-[-0.14px] text-[14px]">{thirdpartyBridge.name}</span>
          <span className="text-[#FFFFFF4D] font-medium text-[14px]">
            { thirdpartyBridge.address.split("/")[0] }
          </span>
        </div>
      </div>
      <SquareArrowTopRight className="" />
    </div>
  </a>
  );
};

