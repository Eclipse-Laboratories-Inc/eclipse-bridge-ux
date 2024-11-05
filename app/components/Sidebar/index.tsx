import "./sidebar.css";
import { BridgeIcon, WalletIcon, TethIcon, ScanIcon, GasStationIcon, FaucetIcon } from "@/app/components/icons"
import { NetworkSwitcher } from "../Deposit/NetworkSwitcher";
import { useState, type ReactNode } from "react";
import { toKebabCase } from "@/lib/stringUtils";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'


const ToggleIcon: React.FC<{ isExtended: boolean }> = ({ isExtended }) => {
  return (
    <svg width="20" 
         height="20" 
         viewBox="0 0 20 20" 
         fill="none" 
         xmlns="http://www.w3.org/2000/svg" 
         style={ !isExtended ? { transform: "rotate(180deg)", transition: "transform 0.1s" } : { transition: "transform 0.1s" }}>
      <path d="M8.33509 13.3333L5.88564 10.8839C5.39749 10.3957 5.39749 9.60421 5.88564 9.11604L8.33509 6.66663M14.1685 13.3333L11.719 10.8839C11.2308 10.3957 11.2308 9.60421 11.719 9.11604L14.1685 6.66663" stroke="white" stroke-opacity="0.3" stroke-width="1.7971" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

const SidebarItem: React.FC<{name: string, icon: ReactNode, isExtended: boolean}> = ({ name, icon, isExtended }) => {  
  const [hover, setHover] = useState(false);
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div className={ `side-item flex flex-row items-center ${ pathName.slice(1) === toKebabCase(name) ? "highlight-icon" : "" }`} 
         style={{ gap: "11px", padding: isExtended ? "4px" : "0px", background: !isExtended ? "none" : ""}}
         onMouseEnter={() => setHover(true)}
         onMouseLeave={() => setHover(false)}
         onClick={() => router?.push(toKebabCase(name))}>
      <div className={ `flex items-center justify-center side-icon-box` } style={{width: "38px", height: "38px"}}>
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
    <div className="sidebar flex flex-col justify-between" style={{ width: isExtended ? "215px" : "66px"}}>
      <div>
        <NetworkSwitcher isExtended={isExtended} />
        <div className="sidebar-tabs flex flex-col" style={{ marginTop: "14px", marginLeft: "14px" }}>
          <SidebarItem isExtended={isExtended} name="Bridge" icon={<BridgeIcon />} />
          <SidebarItem isExtended={isExtended} name="Gas Station" icon={<GasStationIcon />} />
          <SidebarItem isExtended={isExtended} name="Mint tETH" icon={<TethIcon />} />
          <SidebarItem isExtended={isExtended} name="Eclipse Scan" icon={<ScanIcon />} />
        </div>
      </div>
      <div className="flex w-[31px] mb-[20px] h-[31px] rounded-full cursor-pointer border-[#ffffff1a] bg-black border-[1.35px] items-center justify-center ml-[calc(100%-15.5px)]"
           onClick={() => {setIsExtended((current) => !current)}}>
        <ToggleIcon isExtended={ isExtended }/>
      </div>
    </div>
  );
};

