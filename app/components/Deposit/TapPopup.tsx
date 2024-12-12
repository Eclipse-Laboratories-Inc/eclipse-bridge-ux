import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cross, ArrowUpRight } from "../icons";

const TapPopup: React.FC = () => {
  const [isTapPopupVisible, setIsTapPopupVisible] = useState<boolean>(false);

  useEffect(() => {
    const popupClosed = localStorage.getItem("tapPopup");
    if (popupClosed === null) {
      setIsTapPopupVisible(true);
    }
  }, []);

  const closePopup = () => {
    setIsTapPopupVisible(false);
    localStorage.setItem("tapPopup", "true");
  };

  return (
    <>
      {isTapPopupVisible && (
        <>
          <div className="lrt-box flex flex-row justify-between items-center !bg-[#A6D3FA] mb-[20px]" style={{
            background: 'url("/clouds.png")',
            backgroundSize: '585px',
            backgroundPosition: 'calc(100% + 53px) calc(100% + 269px)',
            border: '1px solid rgba(161, 254, 160, 0.10)'
          }}>
            <div className="flex flex-col justify-between h-full">
              <span
                className="text-[28px] text-stroke text-[#F4DE5C] font-semibold w-[247px] h-[52px] text-left line-[26px] leading-[26px]" style={{
                  fontFamily: '"Mikado"'
                }}>
                More Yapping,
              </span>
              <span
                className="text-[28px] text-stroke text-[#F4DE5C] font-semibold mt-[-10px] w-[247px] h-[52px] text-left line-[26px] leading-[26px]" style={{
                  fontFamily: '"Mikado"'
                }}>
                More Tapping
              </span>
              <Link href="https://tap.eclipse.xyz">
                <div className="group flex flex-row gap-[8px] items-center">
                  <span
                    className="text-[14px] font-medium text-left text-[#303283] group-hover:text-[#007D00]"
                    style={{
                      transition: "color 0.2s var(--ease-in-quad)",
                    }}
                  >
                    Earn Grass Now
                  </span>
                  <ArrowUpRight className="stroke-[#303283] group-hover:stroke-[#007D00]"/>
                </div>
              </Link>
            </div>
            <div className="ml-[-50px] mb-[-50px]">
              <img
                src="cow.png"
                alt="LRT image."
                className="h-[220px] w-[258px] max-w-none"
              />
            </div>
            <div onClick={closePopup}>
              <Cross crossClassName="tap-cross" />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TapPopup;
