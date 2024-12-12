import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cross, ArrowUpRight } from "../icons";

const LrtPopup: React.FC = () => {
  const [lrtVisible, setLrtVisible] = useState<boolean>(false);

  useEffect(() => {
    const popupClosed = localStorage.getItem("lrtPopup");
    if (popupClosed === null) {
      setLrtVisible(true);
    }
  }, []);

  const closePopup = () => {
    setLrtVisible(false);
    localStorage.setItem("lrtPopup", "true");
  };

  return (
    <>
      {lrtVisible && (
        <>
          <div className="lrt-box flex flex-row justify-between items-center">
            <div className="flex flex-col justify-between h-full">
              <span
                className="text-[20px] font-semibold w-[247px] h-[52px] text-left line-[26px]"
                style={{ lineHeight: "26px" }}
              >
                Deposit your LRTs to earn restaked yield
              </span>
              <Link href="/mint-teth">
                <div className="group flex flex-row gap-[8px] items-center">
                  <span
                    className="text-[14px] font-medium text-left text-[#a1fea0] group-hover:text-[#74FF71]"
                    style={{
                      transition: "color 0.1s var(--ease-out-quad)",
                    }}
                  >
                    Deposit Now
                  </span>
                  <ArrowUpRight className="stroke-[#A1FEA0] group-hover:stroke-[#74FF71]"/>
                </div>
              </Link>
            </div>
            <div className="ml-[70px]">
              <img
                src="lrt.svg"
                alt="LRT image."
                className="h-[115px] max-w-none"
              />
            </div>
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>
            <div className="circle circle4"></div>
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

export default LrtPopup;
