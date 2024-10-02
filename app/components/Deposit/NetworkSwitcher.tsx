import { useState } from "react";
import { Chevron } from "../icons";
import "./NetworkSwitcher.css";

enum Options {
  Mainnet = "Mainnet",
  Testnet = "Testnet",
  Thirdparty = "Thirdparty"
}

export const NetworkSwitcher: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Options>(Options.Mainnet);

  return (
    <div className="switcher-main flex flex-col items-center">
      <div onClick={() => setIsModalOpen(!isModalOpen)} className="net-switcher flex flex-row items-center justify-center">
        <span>{selectedOption}</span>
        <Chevron />
      </div>

      {isModalOpen && (
        <div className="network-options flex flex-col" hidden={!isModalOpen}>
          {Object.values(Options).map((option) => (
            <div key={option} onClick={() => { setSelectedOption(option); setIsModalOpen(!isModalOpen) }}>
              {option}
            </div>
          ))}
        </div>
      )}
    </div> 
  );
}
