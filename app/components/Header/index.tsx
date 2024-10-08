'use client';

import React from "react";
import { ProfileAvatar } from "./ProfileAvatar";

export const Header: React.FC<{ isExtended: boolean }> = ({ isExtended }) => {
  return (
    <header className="header w-full bg-black text-green-500 flex items-center justify-between border-b border-white border-opacity-10">
      <div className="ecl-logo flex items-center justify-center space-x-2" style={{ width: isExtended ? "250px" : "66px"}}>
      { isExtended 
        ? <img src="/wordmark.png" className="desktop-logo" alt="Eclipse Logo" width={183} height={34} /> 
        : <img src="/eclipse-e.png" className="mobile-logo" alt="Eclipse Logo" width={35} height={34} />
      } 
      </div>
      <h1 className="text-xl tracking-widest bridge-text">BRIDGE</h1>
      <ProfileAvatar />
    </header>
  );
};
