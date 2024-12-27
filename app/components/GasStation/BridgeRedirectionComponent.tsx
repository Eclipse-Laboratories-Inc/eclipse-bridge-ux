import classNames from "classnames";
import { Token } from "./TokenManager";

type TokenBridge = {
  text: string;
  bridge: string;
};

const tokenBridges: Record<Token["symbol"], TokenBridge> = {
  SOL: {
    text: "Bridge your SOL from Solana to Eclipse.",
    bridge: "https://usenexus.org",
  },
  USDC: {
    text: "Bridge your USDC from any chain to Eclipse.",
    bridge: "https://usenexus.org",
  },
  tETH: {
    text: "Mint tETH by depositing LRTs on Ethereum.",
    bridge: "/mint-teth",
  },
  WIF: { text: "", bridge: "" },
};

const BridgeNowButton: React.FC<{ token: Token["symbol"] }> = ({ token }) => {
  const bridgeAddress = tokenBridges[token].bridge;
  return (
    <a
      className={classNames(
        "flex w-[140px] h-[40px] gap-[4px]",
        "items-center justify-center rounded-[10px]",
        "bg-[#A1FEA00D] text-[#A1FEA0] text-[16px] font-medium",
        "cursor-pointer hover:bg-[#a1fea014] transition-all active:scale-[0.97]",
        "hover:text-[#A1FEA0]",
      )}
      href={bridgeAddress}
      target={bridgeAddress.startsWith("/") ? "_self" : "_blank"}
    >
      Bridge Now
    </a>
  );
};

export const BridgeRedirectionComponent: React.FC<{
  token: Token["symbol"];
}> = ({ token }) => {
  return (
    <div
      className={classNames(
        "flex w-[520px] p-[20px] mt-[-45px]",
        "rounded-[20px] border border-[#FFFFFF1A] justify-between",
      )}
    >
      <div className="flex flex-col text-sm font-medium leading-[20px]">
        <span className="text-[#FFFFFF4D]">
          You don&apos;t have any {token} on Eclipse right now.
        </span>
        <span className="text-[#A1FEA0]">{tokenBridges[token].text}</span>
      </div>
      <BridgeNowButton token={token} />
    </div>
  );
};
