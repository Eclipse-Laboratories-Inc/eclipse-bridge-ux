"use client";

import React from "react";
import { ProfileAvatar } from "./ProfileAvatar";

export const Header: React.FC<{ isExtended: boolean }> = ({ isExtended }) => {
  return (
    <header className="header w-full bg-black text-green-500 flex items-center justify-between border-b border-white border-opacity-10">
      <div className="flex items-center space-x-2 flex-none sm:flex-1 !w-auto">
        {isExtended ? (
          <div className="pr-2">
            <img
              src="/wordmark.png"
              className="desktop-logo hidden sm:block"
              alt="Eclipse Logo"
              width={183}
              height={34}
              style={{ marginLeft: "14px", maxWidth: "none" }}
            />
            <img
              src="/eclipse-e.png"
              className="mobile-logo block sm:hidden"
              alt="Eclipse Logo"
              width={35}
              height={34}
              style={{ marginLeft: "14px", maxWidth: "none" }}
            />
          </div>
        ) : (
          <img
            src="/eclipse-e.png"
            className="mobile-logo"
            alt="Eclipse Logo"
            width={35}
            height={34}
            style={{ marginLeft: "14px", maxWidth: "none" }}
          />
        )}
      </div>
      <ProfileAvatar />
    </header>
  );
};
