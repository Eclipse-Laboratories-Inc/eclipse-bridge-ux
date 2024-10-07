import "./sidebar.css";
import { BridgeIcon, WalletIcon, TethIcon, ScanIcon, GasStationIcon, FaucetIcon } from "@/app/components/icons"
import { NetworkSwitcher } from "../Deposit/NetworkSwitcher";
import { useState, type ReactNode } from "react";


const SidebarItem: React.FC<{name: string, icon: ReactNode, isExtended: boolean}> = ({ name, icon, isExtended }) => {  
  return (
    <div className="side-item flex flex-row items-center" style={{ gap: "11px" }}>
      <div className="flex items-center justify-center side-icon-box" style={{width: "38px", height: "38px"}}>
        {icon}
      </div>
      { isExtended && <span style={{fontWeight: "500", fontSize: "16px"}}>{name}</span> } 
    </div>
  );
}

export const Sidebar: React.FC = () => {
  const [isExtended, setIsExtended] = useState<boolean>(true);
  return (
    <div className="sidebar flex flex-col" onClick={() => {setIsExtended((current) => !current)}} style={{ width: isExtended ? "250px" : "66px"}}>
      <NetworkSwitcher isExtended={isExtended} />
      <div className="sidebar-tabs flex flex-col" style={{ gap: "14px", marginTop: "17px" }}>
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
