import React from "react";
import Image from "next/image";

interface TooltipProps {
  text: string;
}

export function Tooltip({ text }: TooltipProps) {
  return (
    <div className="relative group">
      <button type="button" className="focus:outline-none flex items-center justify-center">
        <Image src="/info.svg" alt="info" width={18} height={18} />
      </button>
      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-2 text-[12px] text-left text-white bg-[#1B1B1B] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 w-[175px]">
        {text}
        {/* Tooltip Arrow */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-0 h-0 border-t-2 border-b-2 border-l-2 border-transparent border-l-[#1B1B1B]"></div>
      </div>
    </div>
  );
}
