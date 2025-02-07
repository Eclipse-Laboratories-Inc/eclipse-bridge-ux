import { chainMetadata, eclipsemainnet, eclipsemainnetAddresses, warpRouteConfigs } from "@hyperlane-xyz/registry";
import { ChainMap, ChainMetadata, MultiProtocolProvider, WarpCore } from "@hyperlane-xyz/sdk";
import { Address } from "viem";

const chains: ChainMap<ChainMetadata & { mailbox?: Address }> = {
  eclipsemainnet: {
    ...eclipsemainnet,
    mailbox: eclipsemainnetAddresses.mailbox as Address,
  },
  ethereum: {
    ...chainMetadata.ethereum,
  },
};
const multiProvider = new MultiProtocolProvider(chains);
export const warpCore = WarpCore.FromConfig(multiProvider, {
  tokens: warpRouteConfigs["tETH/eclipsemainnet-ethereum"].tokens,
});
