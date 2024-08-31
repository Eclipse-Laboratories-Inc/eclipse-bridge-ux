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
  
  :root {
    --dynamic-base-1: red!important;
  }
  
  .bridge-welcome-layout, .wallet-progress-stepper, .accordion-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    background: rgb(5, 5, 5);
  }
  
  .wallet-progress-stepper {border-radius: 20px;} 
  
  .wallet-list-item__tile {
    background: rgba(255, 255, 255, 0.03);
  }

  .accordion-item, .default-footer__footer {background: rgb(5, 5, 5);}
  .button {background: rgba(161, 254, 160, 1); }
  .button span {color: black; font-size: 15px;}
  .stepper {
    background: rgba(255, 255, 255, 0.03);
    padding: 8px;
    border-radius: 10px;
    padding-inline: 16px;
  }
  .badge__container {
    background: rgba(255, 255, 255, 0.03);
    color: rgba(71, 121, 255, 1);
  }
  .badge__dot {background-color: rgba(71, 121, 255, 1);}

  .tos-and-pp__link {color: rgba(161, 254, 160, 1)!important;}
  .tos-and-pp__text {color: white; font-size: 12px; font-weight: 500;}
  .dynamic-shadow-dom-content div {
    transition: none;
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
          events: {
              onAuthFlowOpen: () => {
                const depositBox = document.getElementsByClassName("deposit-container")[0] as HTMLElement;
                depositBox.style.transform = "scale(0.9)";
            },
            onAuthFlowClose: () => {
                const depositBox = document.getElementsByClassName("deposit-container")[0] as HTMLElement;
                depositBox.style.transform = "scale(1)";
            }
          },
          walletsFilter: (wallets) => wallets.filter((w) => w.walletConnector.supportedChains.includes("EVM") || w.key === "phantom"),
          environmentId: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || '',
          walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
          initialAuthenticationMode: 'connect-only',
          displaySiweStatement: true,
          privacyPolicyUrl: "https://www.eclipse.xyz/privacy-policy",
          termsOfServiceUrl: "https://www.eclipse.xyz/terms",
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
