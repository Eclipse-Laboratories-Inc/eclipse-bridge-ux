"use client";
import "@/app/globals.css";
import { Providers } from "@/app/providers/providers";
import { IBM_Plex_Sans } from "next/font/google";
import { WagmiProvider } from "@/app/providers/wagmiProvider";
import { WalletFilterProvider } from "@/app/providers/WalletFilterProvider";
import { DynamicProvider } from "@/app/providers/DynamicProvider";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// sepolia
// const evmNetworks = [
//   {
//     blockExplorerUrls: ["https://sepolia.etherscan.io/"],
//     chainId: 11155111,
//     chainName: "Ethereum Sepolia",
//     iconUrls: ["https://app.dynamic.xyz/assets/networks/eth.svg"],
//     name: "Ethereum",
//     nativeCurrency: {
//       decimals: 18,
//       name: "Ether",
//       symbol: "ETH",
//     },
//     networkId: 11155111,
//     rpcUrls: ["https://sepolia.drpc.org"],
//     vanityName: "Sepolia",
//   },
// ];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <WalletFilterProvider>
        <WagmiProvider>
          {({ chains }) => {
            return (
              <DynamicProvider chains={chains}>
                <Providers chains={chains}>
                  <body className={ibmPlexSans.className}>{children}</body>
                </Providers>
              </DynamicProvider>
            );
          }}
        </WagmiProvider>
      </WalletFilterProvider>
    </html>
  );
}
