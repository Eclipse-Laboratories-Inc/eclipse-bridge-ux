import { mainnet, sepolia, Chain} from "viem/chains";

interface Config {
  bridgeProgram: string,
  bridgeContract: string,
  eclipseRpc: string,
  currentChain: Chain,
  etherscanAddress: string
}

const config: Config = {
  bridgeProgram: "3gcds6MrhVNPBxoWR8kaXnv486w4VxWgh8GYPsfJaMRt",
  bridgeContract: "0x11b8db6bb77ad8cb9af09d0867bb6b92477dd68e",
  eclipseRpc: "https://testnet.dev2.eclipsenetwork.xyz",
  currentChain: sepolia,
  etherscanAddress: "https://api-sepolia.etherscan.io/api"
};

export default config;
