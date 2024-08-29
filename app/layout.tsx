'use client';
import "./globals.css";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  SolanaWalletConnectors,
} from "@/lib/dynamic";
import { Providers } from "@/app/providers";
import { IBM_Plex_Sans } from 'next/font/google';
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const cssOverrides = `
  img[data-testid='iconic-solana'] {
    content: url('/eclipse.png');
  }
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <DynamicContextProvider
        settings={{
          walletsFilter: (wallets) => wallets.filter((w) => w.walletConnector.supportedChains.includes("EVM") || w.key === "phantom"),
          environmentId: "32962fd3-4365-4b90-807c-ad2176a3df99", 
          walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
          initialAuthenticationMode: 'connect-only',
          overrides: {
            chainDisplayValues: {
              solana: {
                 displayName: 'Eclipse'
              }
           }
          },
          cssOverrides,
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
            <body className={ibmPlexSans.className}>{children}</body>
        </Providers>
      </DynamicContextProvider>
    </html>
  );
}
