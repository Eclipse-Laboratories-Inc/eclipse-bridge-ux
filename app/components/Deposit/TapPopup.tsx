import React, { useState } from "react";
import Link from "next/link";
import { Cross, ArrowUpRight, GrassIcon, PassiveGrassBanner } from "../icons";

const TapPopup: React.FC = () => {
  const [isTapPopupVisible, setIsTapPopupVisible] = useState<boolean>(true);

  const closePopup = () => {
    setIsTapPopupVisible(false);
  };

  return (
    <>
      {isTapPopupVisible && (
        <>
          <div
            className="lrt-box flex flex-row justify-between items-center !bg-[#A6D3FA] mb-[20px]"
            style={{
              background: 'url("/clouds.png")',
              backgroundSize: "585px",
              backgroundPosition: "calc(100% + 53px) calc(100% + 269px)",
              border: "1px solid rgba(161, 254, 160, 0.10)",
            }}
          >
            <div className="flex flex-col justify-between h-full w-[40%]">
              <span
                className="text-[28px] text-stroke text-[#F4DE5C] font-semibold w-[247px] h-[52px] text-left line-[26px] leading-[26px]"
                style={{
                  fontFamily: '"Mikado"',
                }}
              >
                Bridge Now To
              </span>
              <span
                className="text-[28px] text-stroke text-[#F4DE5C] font-semibold mt-[-10px] w-[247px] h-[52px] text-left line-[26px] leading-[26px]"
                style={{
                  fontFamily: '"Mikado"',
                }}
              >
                <div className="flex flex-row gap-1 items-center">
                  <p>Grow Grass</p>
                  <img className="w-[25.5px]" src="/grass.png" />
                </div>
              </span>
              <Link href="https://tap.eclipse.xyz" target="_blank">
                <div className="group flex flex-row gap-[8px] items-center">
                  <span
                    className="text-[14px] font-medium text-left text-[#303283] group-hover:text-[#007D00]"
                    style={{
                      transition: "color 0.2s var(--ease-in-quad)",
                    }}
                  >
                    Start Tapping
                  </span>
                  <ArrowUpRight className="stroke-[#303283] group-hover:stroke-[#007D00]" />
                </div>
              </Link>
            </div>
            <div className="mr-[-45px] mb-[-15px]">
              <img
                className="w-[255px]"
                src="/passive-grass-banner.png"
                alt=""
              />
              <img
                className="absolute mt-[-130px] ml-[135px] w-[52px]"
                src="/passive-grass-plus-one.png"
                alt=""
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
