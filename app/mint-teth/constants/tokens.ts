import { Address } from "viem";
import { TokenOption } from "../components/TokenSelect";

export const tokenAddresses: `0x${string}`[] = [
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee", // weETH
  "0xbf5495efe5db9ce00f80364c8b423567e58d2110", // ezETH
  "0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6", // apxETH
  "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0", // rswETH
];

export const tokenOptions: TokenOption[] = [
  { value: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", label: "WETH", imageSrc: "/token-weth.svg" },
  { value: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee", label: "weETH", imageSrc: "/token-weeth.svg" },
  { value: "0xbf5495efe5db9ce00f80364c8b423567e58d2110", label: "ezETH", imageSrc: "/token-ezeth.svg" },
  { value: "0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6", label: "apxETH", imageSrc: "/token-apxeth.svg" },
  { value: "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0", label: "rswETH", imageSrc: "/token-rsweth.svg" },
];

// tETH token address on Eclipse
export const tEthTokenAddress = "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn";
