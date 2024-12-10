import React, { useState, useEffect, useRef } from "react";
import { useNetwork } from "@/app/contexts/NetworkContext";
import { Chevron, Ellipse, Loading } from "../icons";
import "./NetworkSwitcher.css";
import { useWallets } from "@/app/hooks/useWallets";
import { Options } from "@/lib/networkUtils";
import { toast } from "react-toastify";
import { Notification } from "../GasStation/Notification";

export const NetworkSwitcher: React.FC<{ isExtended: boolean }> = ({
  isExtended,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { selectedOption, setSelectedOption } = useNetwork();
  const [isSwitching, setIsSwitching] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { evmWallet } = useWallets();
  const customStyle = isExtended
    ? {}
    : { marginLeft: "240px", marginTop: "0px", width: "150px" };

  const switchChain = async (o: Options) => {
    const cid = o === Options.Mainnet ? 1 : 11155111;
    const isEVMConnected = await evmWallet?.isConnected();

    if (evmWallet?.connector.supportsNetworkSwitching()) {
      try {
        setIsSwitching(true);
        await evmWallet?.connector.switchNetwork({ networkChainId: cid });
        setSelectedOption(o);
      } catch {
        toast(
          <Notification
            type={"error"}
            title={
              "Failed to switch network. Approve the prompt in your wallet."
            }
            classNames="bg-black"
          />
        );
      } finally {
        setIsSwitching(false);
      }
    } else if (!evmWallet || isEVMConnected === false) {
      // wallet doesn't exist / isn't connected; switching is OK since it's just metadata changing
      // wallet metadata will be updated when connected
      setSelectedOption(o);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(!isModalOpen);
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div
      className="switcher-main flex flex-col items-center"
      ref={modalRef}
      style={{ width: isExtended ? "187px" : "38px" }}
    >
      <div
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="net-switcher flex flex-row items-center justify-between"
      >
        {isSwitching ? (
          <Loading
            style={{ color: "rgba(161, 254, 160, 1)" }}
            loadingClassName=""
          />
        ) : (
          <div className="flex flex-row">
            <Ellipse />
            {isExtended && <span>{selectedOption}</span>}
          </div>
        )}

        <Chevron />
      </div>

      {isModalOpen && (
        <div
          className="network-options flex flex-col"
          hidden={!isModalOpen}
          style={customStyle}
        >
          {Object.values(Options).map((option) => (
            <div
              key={option}
              onClick={() => {
                switchChain(option);
                setIsModalOpen(!isModalOpen);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
