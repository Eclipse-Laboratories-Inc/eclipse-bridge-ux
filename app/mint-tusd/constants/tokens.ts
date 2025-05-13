import { SelectOption } from "../components/EcSelect";

export const tokenAddresses: `0x${string}`[] = [
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
];

export const tokenOptions: SelectOption[] = [
  {
    value: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    label: "USDC",
    imageSrc: "/token-usdc.png",
  },
];

export const chainOptions: SelectOption[] = [
  { value: "eclipse", label: "Eclipse", imageSrc: "/eclipse.png" },
  { value: "ethereum", label: "Ethereum", imageSrc: "/eth.png" },
];

// tETH token address on Eclipse
export const tethSvmTokenAddress =
  "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn";
export const tethEvmTokenAddress = "0x19e099B7aEd41FA52718D780dDA74678113C0b32";

// tUSD token address on Eclipse
export const tusdSvmTokenAddress =
  "27Kkn8PWJbKJsRZrxbsYDdedpUQKnJ5vNfserCxNEJ3R";
export const tusdEvmTokenAddress = "0x722a851B6798D65b80526562Fc3a36E19b1F883b";
