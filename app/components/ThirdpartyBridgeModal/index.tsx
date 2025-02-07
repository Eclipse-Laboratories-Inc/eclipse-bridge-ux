"use client";

import React from "react";
import { ThirdpartyBridgesIcon, Cross } from "../icons";
import { ThirdpartyBridgeItem } from "./ThirdpartyBridgeItem";
import { thirdpartyBridges } from "./constants";
import { useSidebar } from "@/app/contexts/SidebarContext";
import { WarningComponent } from "@/app/components/WarningComponent";
import { useThirdpartyBridgeModalContext } from "./ThirdpartyBridgeModalContext";

export const ThirdpartyBridgesPill: React.FC = () => {
  return (
    <>
      <div
        className="
          flex flex-row items-center gap-[10px] 
          pl-[20px] py-[11px] pr-[12px]
          rounded-[70px] border-[1px] border-[#FFFFFF1A]
          bg-[#FFFFFF0D] cursor-pointer
          hover:bg-[#ffffff12]
          transition-all thirdparty-bridge-pill
    "
      >
        <span
          className="
              font-medium text-[#FFFFFF99] text-[16px]
      "
        >
          Use Third-Party Bridges
        </span>
        <ThirdpartyBridgesIcon bridgesClassName="" />
      </div>
      <ThirdpartyBridgesModal />
    </>
  );
};

export const ThirdpartyBridgesModal = () => {
  const { isSidebar } = useSidebar();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { isThirdpartyBridgeModalOpen, toggleThirdpartyBridgeModal, setIsThirdpartyBridgeModalOpen } =
    useThirdpartyBridgeModalContext();


  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      toggleThirdpartyBridgeModal()
    }
  };

  return (
    <div
      className={`
        fixed top-0 left-0 w-screen h-screen z-[999]
        flex justify-center items-center
        transition-[backdrop-filter,opacity] duration-[400ms] ease-in-out
        ${
          isThirdpartyBridgeModalOpen
            ? "opacity-100 pointer-events-auto backdrop-blur-[2px]"
            : "opacity-0 pointer-events-none backdrop-blur-none"
        }
      `}
      onClick={handleBackdropClick}
    >
      {/* Modal content */}
      <div
        className={`
          relative bg-black rounded-[30px] border-[1px] border-[#FFFFFF1A]
          transition-[transform,opacity] duration-[400ms] ease-in-out
          ${isSidebar ? "sm:ml-[212px]" : "sm:ml-[70px]"}
          ${
            isThirdpartyBridgeModalOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }
        `}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="flex items-center flex-row justify-between h-[64px] p-[20px]">
          <span></span>
          <span className="text-[18px] font-medium tracking-[-0.18px] leading-6">
            Third-Party Bridges
          </span>
          <button
            onClick={toggleThirdpartyBridgeModal}
            className="hover:opacity-80 transition-opacity"
          >
            <Cross crossClassName="wallets-cross w-[24px] h-[24px]" />
          </button>
        </div>

        <div className="flex flex-col border-t-[1px] border-t-[#FFFFFF1A] p-[20px] gap-[8px]">
          {thirdpartyBridges.map((bridge, index) => (
            <ThirdpartyBridgeItem thirdpartyBridge={bridge} key={index} />
          ))}
          <WarningComponent message="These service providers are independent. Eclipse provides links to them for your convenience, but is not responsible for their operation." />
        </div>
      </div>
    </div>
  );
};
