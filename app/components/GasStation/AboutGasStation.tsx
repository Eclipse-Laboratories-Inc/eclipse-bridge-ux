import React from "react";
import { useSidebar } from "@/app/contexts/SidebarContext";
import classNames from "classnames";
import { Cross } from "../icons";
import { WarningComponent } from "@/app/components/WarningComponent";
import Image from "next/image";

export interface AboutGasStationProps {
  closeModal: () => void;
  isOpen: boolean;
}

export const AboutGasStationComponent: React.FC<AboutGasStationProps> = ({
  closeModal,
  isOpen,
}) => {
  const { isSidebar } = useSidebar();
  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  return (
    <div
      className={`
        fixed top-0 left-0 w-screen h-screen z-[999]
        flex justify-center items-center
        transition-[backdrop-filter,opacity] duration-[400ms] ease-in-out
        ${
          isOpen
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
          mt-[20px]
          ${isSidebar ? "sm:ml-[212px]" : "sm:ml-[70px]"}
          ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="flex items-center flex-row justify-center h-[64px] p-[20px]">
          <span></span>
          <span className="text-[18px] font-medium tracking-[-0.18px] leading-6">
            About Gas Station
          </span>
          <button
            onClick={closeModal}
            className="hover:opacity-80 transition-opacity absolute ml-[88%]"
          >
            <Cross crossClassName="cursor-pointer w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="flex flex-col p-[20px] gap-[8px] justify-center">
          <div className={classNames("flex flex-col items-center gap-5 mb-5")}>
            <Image
              src="/gas-station-info.png"
              width={96}
              height={96}
              className="rounded-[50%]"
              alt="Gas Station Icon"
            />
            <span className="block text-[#FFFFFF99] text-[18px] w-[396px] text-center font-medium leading-7">
              No ETH in your wallet? No problem!
              <br /> Swap your tokens on Eclipse (like SOL, USDC, or tETH) for
              ETH to power your transactions.
            </span>
          </div>
          <WarningComponent
            className="w-[450px]"
            textClassName="text-[14px]"
            message="Heads up! This isn't a bridge. If your tokens are on another network, you'll need to bridge them to Eclipse first."
          />
        </div>
      </div>
    </div>
  );
};
