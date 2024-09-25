'use client';

import React from "react";
import { ProfileAvatar } from "./ProfileAvatar";

export const Header: React.FC = () => {
  return (
    <header className="header w-full bg-black text-green-500 flex items-center justify-between p-4 border-b border-white border-opacity-10">
      <div className="flex items-center space-x-2">
        <img src="/wordmark.png" className="desktop-logo" alt="Eclipse Logo" width={183} height={34} />
        <img src="/eclipse-e.png" className="mobile-logo" alt="Eclipse Logo" width={35} height={34} />
      </div>
      <h1 className="text-xl tracking-widest bridge-text">BRIDGE</h1>
      <ProfileAvatar />
    </header>
  );
};
