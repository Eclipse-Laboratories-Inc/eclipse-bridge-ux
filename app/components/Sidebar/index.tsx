import "./sidebar.css";
import { BridgeIcon, WalletIcon, TethIcon, ScanIcon, GasStationIcon, FaucetIcon } from "@/app/components/icons"
import { NetworkSwitcher } from "../Deposit/NetworkSwitcher";
import { useState, type ReactNode } from "react";


const SidebarItem: React.FC<{name: string, icon: ReactNode, isExtended: boolean}> = ({ name, icon, isExtended }) => {  
  const [hover, setHover] = useState(false);
  return (
    <div className="side-item flex flex-row items-center" 
         style={{ gap: "11px", padding: isExtended ? "4px" : "0px", background: !isExtended ? "none" : ""}}
         onMouseEnter={() => setHover(true)}
         onMouseLeave={() => setHover(false)}>
      <div className="flex items-center justify-center side-icon-box" style={{width: "38px", height: "38px"}}>
        {icon}
      </div>
      { isExtended && <span style={{fontWeight: "500", fontSize: "16px"}}>{name}</span> } 
      
      { hover && !isExtended && (
        <>
          <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "-7px"}}>
            <path style={{ stroke: "none" }} d="M5 7.5V0.5L1.17033 3.18077C0.601614 3.57887 0.601616 4.42113 1.17033 4.81923L5 7.5Z" fill="white" fill-opacity="0.08"/>
          </svg>
          <div className="sidebar-hover flex items-center justify-center">
            <span>{ name }</span>
          </div>
        </>
      )}
    </div>
  );
}

export const Sidebar: React.FC<{ isExtended: boolean, setIsExtended: React.Dispatch<React.SetStateAction<boolean>>}> = ({ isExtended, setIsExtended }) => {
  return (
    <div className="sidebar flex flex-col" onClick={() => {setIsExtended((current) => !current)}} style={{ width: isExtended ? "215px" : "66px"}}>
      <NetworkSwitcher isExtended={isExtended} />
      <div className="sidebar-tabs flex flex-col" style={{ marginTop: "14px", marginLeft: "14px" }}>
        <SidebarItem isExtended={isExtended} name="Bridge" icon={<BridgeIcon />} />
        <SidebarItem isExtended={isExtended} name="Wallet" icon={<WalletIcon />} />
        <SidebarItem isExtended={isExtended} name="Faucet" icon={<FaucetIcon />} />
        <SidebarItem isExtended={isExtended} name="Scan" icon={<ScanIcon />} />
        <SidebarItem isExtended={isExtended} name="Gas Station" icon={<GasStationIcon />} />
        <SidebarItem isExtended={isExtended} name="Mint tETH" icon={<TethIcon />} />
      </div>
    </div>
  );
};
