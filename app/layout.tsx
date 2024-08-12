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
          environmentId: "81a3762f-e656-40a7-b739-c177be6712df",
          walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
          initialAuthenticationMode: 'connect-only',
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
