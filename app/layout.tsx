'use client';
import "./globals.css";
import { Inter } from "next/font/google";
import {
  DynamicContextProvider,
  DynamicWidget,
  EthereumWalletConnectors,
  SolanaWalletConnectors,
} from "@/lib/dynamic";
import { Providers } from "@/app/providers";


const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <DynamicContextProvider
        settings={{
          environmentId: "81a3762f-e656-40a7-b739-c177be6712df",
          walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
          initialAuthenticationMode: 'connect-only',
          bridgeChains: [
            {
              chain: "EVM",
            },
            {
              chain: "SOL",
            },
          ],
        }}
      >
        <Providers>
            <body className={inter.className}>{children}</body>
        </Providers>
      </DynamicContextProvider>
    </html>
  );
}
