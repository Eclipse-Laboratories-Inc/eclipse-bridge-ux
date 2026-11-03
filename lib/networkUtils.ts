import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

export enum Options {
    Mainnet = 'Mainnet',
    Testnet = 'Testnet',
  }
  
export type OptionsLower = Lowercase<Options>

export function toOptionsLower(o: Options): OptionsLower {
    return o.toLowerCase() as OptionsLower
}

export function createEthPublicClient(o: Options) {
    const isMainnet = o === Options.Mainnet
    return createPublicClient({
        chain: isMainnet ? mainnet : sepolia,
        transport: isMainnet
            ? http("https://empty-responsive-patron.quiknode.pro/91dfa8475605dcdec9afdc8273578c9f349774a1/")
            : http("https://ethereum-sepolia-rpc.publicnode.com"),
        batch: { multicall: true },
    })
}
