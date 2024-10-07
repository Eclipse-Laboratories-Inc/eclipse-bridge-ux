import "./sidebar.css";
import { BridgeIcon, WalletIcon, TethIcon, ScanIcon, GasStationIcon, FaucetIcon } from "@/app/components/icons"
import { type ReactNode } from "react";


const NetworkSwitch: React.FC = () => {
  return <div></div>
}

const SidebarItem: React.FC<{name: string, icon: ReactNode}> = ({ name, icon }) => {
  return (
    <div className="side-item flex flex-row items-center" style={{ gap: "11px" }}>
      <div className="flex items-center justify-center side-icon-box" style={{width: "38px", height: "38px"}}>
        {icon}
      </div>
      <span style={{fontWeight: "500", fontSize: "16px"}}>{name}</span>
    </div>
  );
}

export const Sidebar: React.FC = () => {
  return (
    <div className="sidebar flex">
      <NetworkSwitch />
      <div className="sidebar-tabs flex flex-col" style={{ gap: "14px", marginTop: "131px" }}>
        <SidebarItem name="Bridge" icon={<BridgeIcon />} />
        <SidebarItem name="Wallet" icon={<WalletIcon />} />
        <SidebarItem name="Faucet" icon={<FaucetIcon />} />
        <SidebarItem name="Scan" icon={<ScanIcon />} />
        <SidebarItem name="Gas Station" icon={<GasStationIcon />} />
        <SidebarItem name="Mint tETH" icon={<TethIcon />} />
      </div>
    </div>
  );
};
