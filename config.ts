import { mainnet, sepolia, Chain} from "viem/chains";

interface Config {
  bridgeProgram: string,
  bridgeContract: string,
  eclipseRpc: string,
  currentChain: Chain,
  etherscanAddress: string
}

const config: Config = {
  bridgeProgram: "br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW",
  bridgeContract: "0x83cB71D80078bf670b3EfeC6AD9E5E6407cD0fd1",
  eclipseRpc: "https://mainnetbeta-rpc.eclipse.xyz",
  currentChain: mainnet,
  etherscanAddress: "https://api.etherscan.io/api"
};

export default config;
