import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cross, ArrowUpRight } from "../icons";

const AirdropPopup: React.FC = () => {
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  useEffect(() => {
    const popupClosed = localStorage.getItem("airdropPopup");
    if (popupClosed === null) {
      setPopupVisible(true);
    }
  }, []);

  const closePopup = () => {
    setPopupVisible(false);
    localStorage.setItem("airdropPopup", "true");
  };

  return (
    <>
      {popupVisible && (
        <>
          <div className="lrt-box flex flex-row justify-between items-center h-[83px] p-[12px]">
            <div className="flex flex-row items-center justify-between h-full">
              <img
                src="/es-token-logo.png"
                alt=""
                width={89}
                style={{ marginLeft: "-20px" }}
              />
              <div>
                <span className="text-[20px] font-semibold w-[247px] h-[52px] text-left line-[26px]">
                  $ES Airdrop is Live!
                </span>
                <Link href="https://claims.eclipse.xyz">
                  <div className="group flex flex-row gap-[8px] items-center">
                    <span
                      className="text-[14px] font-medium text-left text-[#a1fea0] group-hover:text-[#74FF71]"
                      style={{
                        transition: "color 0.1s var(--ease-out-quad)",
                      }}
                    >
                      Claim Now
                    </span>
                    <ArrowUpRight className="stroke-[#A1FEA0] group-hover:stroke-[#74FF71]" />
                  </div>
                </Link>
              </div>
            </div>
            <div onClick={closePopup}>
              <Cross crossClassName="lrt-cross" />
            </div>
          </div>
          <div className="dash-box"></div>
        </>
      )}
    </>
  );
};

export default AirdropPopup;
