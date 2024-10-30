import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cross } from "../icons";


const ArrowUpRight: React.FC = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="stroke-[#A1FEA0] group-hover:stroke-[#74FF71]" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{
        transition: "color 0.1s var(--ease-out-quad)"
      }}>
      <path d="M10.4987 8.75V3.5M10.4987 3.5H5.2487M10.4987 3.5L3.64453 10.3542" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

const LrtPopup: React.FC = () => {
  const [lrtVisible, setLrtVisible] = useState<boolean>(false);

  useEffect(() => {
    const popupClosed = localStorage.getItem('lrtPopup');
    if (popupClosed === null) {
      setLrtVisible(true);
    }
  }, []);

  const closePopup = () => {
    setLrtVisible(false);
    localStorage.setItem('lrtPopup', 'true');
  };

  return (
    <>
      { lrtVisible && 
        <>
          <div className="lrt-box flex flex-row justify-between items-center">
            <div className="flex flex-col justify-between h-full">
              <span className="text-[20px] font-semibold w-[247px] h-[52px] text-left line-[26px]" 
                    style={{lineHeight: "26px"}}>Deposit your LRTs to earn restaked yield
              </span>
              <Link href="https://teth.eclipse.xyz">
                <div className="group flex flex-row gap-[8px] items-center">
                  <span className="text-[14px] font-medium text-left text-[#a1fea0] group-hover:text-[#74FF71]" 
                  style={{
                    transition: "color 0.1s var(--ease-out-quad)"
                  }}>
                    Deposit Now
                  </span> 
                  <ArrowUpRight />
                </div>
              </Link>
            </div>
            <div className="ml-[70px]">
              <img src="lrt.svg" alt="LRT image." className="h-[115px] max-w-none" />
            </div>
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>
            <div className="circle circle4"></div>
            <div onClick={closePopup}><Cross crossClassName='lrt-cross' /></div>
          </div>
          <div className="dash-box" ></div>
        </>
    }
    </>
  )
}

export default LrtPopup;

