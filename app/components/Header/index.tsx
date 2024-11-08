"use client";

import React from "react";
import { ProfileAvatar } from "./ProfileAvatar";

export const Header: React.FC<{ isExtended: boolean }> = ({ isExtended }) => {
  return (
    <header className="header w-full bg-black text-green-500 flex items-center justify-between border-b border-white border-opacity-10">
      <div
        className="ecl-logo flex items-center space-x-2"
        style={{ width: isExtended ? "215px" : "66px" }}
      >
        {isExtended ? (
          <img
            src="/wordmark.png"
            className="desktop-logo"
            alt="Eclipse Logo"
            width={183}
            height={34}
            style={{ marginLeft: "14px", maxWidth: "none" }}
          />
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
