import React, { useState, useEffect } from 'react';
import { Cross } from "../icons";

const LrtPopup: React.FC = () => {
  const [lrtVisible, setLrtVisible] = useState<boolean>(false);

  useEffect(() => {
    const popupClosed = localStorage.getItem('lrtPopup');
    console.log(popupClosed, "orrrcoo")
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
              <span className="text-[14px] font-medium text-left" 
                    style={{ color: "rgba(161, 254, 160, 1)"}}>Deposit Now
              </span> 
            </div>
            <div>
              <img src="lrt.svg" alt="LRT image." className="h-[99px]" />
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
