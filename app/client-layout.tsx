'use client';
import "./globals.css";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  SolanaWalletConnectors,
} from "@/lib/dynamic";
import { Providers } from "@/app/providers";
import { IBM_Plex_Sans } from 'next/font/google';
import { useState, useEffect } from "react"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

// TODO: maybe we can read it from a file
const cssOverrides = `
  div { font-family: 'IBM Plex Sans', sans-serif; }
  img[data-testid='iconic-solana'] {
    content: url('/eclipse.png');
  }
  
  .wallet-progress-stepper, .accordion-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 27px;
    background: rgb(5, 5, 5);
  }
  
  .wallet-progress-stepper {border-radius: 20px;} 
  .wallet-progress-stepper div:first-of-type { background: transparent; }
  .wallet-list-item__tile, .list-tile {
    background: rgba(255, 255, 255, 0.03);
  }
  .wallet-list-item__tile:hover, .list-tile:hover {
    background-color: rgba(255, 255, 255, 0.05)!important;
  }

  .accordion-item, .default-footer__footer {background: rgb(5, 5, 5);}
  .button {background: rgba(161, 254, 160, 1); }
  .button span {color: black; font-size: 15px;}
  .button--padding-large {
    padding: 14px 20px;
  }
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

  .bridge-welcome-layout__body {
    gap: 20px;
    padding: 0 20px 20px;
  }
  .bridge-welcome-layout__message-container { gap: 6px; }
  .portal__backdrop { display: none!important; }
  .modal-header--align-content-bottom {
    border-bottom: none!important;
    margin-bottom: 0!important;
  }
  .modal-header { 
    border-bottom: 1px rgba(255, 255, 255, 0.1) solid; 
    margin-bottom: 16px;
    padding: 20px;
  }
  .step__icon--done {
      background-color: #4779ff!important;
  }
`

// override this on sepolia
const evmNetworks = [{
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    chainId: 11155111,
    chainName: 'Ethereum Sepolia',
    iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
    name: 'Ethereum',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    networkId: 11155111,
    rpcUrls: ['https://sepolia.drpc.org'],
    vanityName: 'Sepolia',
}];
const eclipseWallets = ["backpacksol", "nightlysol", "phantom"]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkWindowSize();
    window.addEventListener('resize', checkWindowSize); 

    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);
  // TODO
  return (
    <html lang="en">
      <DynamicContextProvider
        settings={{
          events: {
              onWalletRemoved: (args) => {
                if (args.wallet.chain === "EVM") { 
                  const client: any = args.wallet.connector.getWalletClient();
                  client.request({ "method": "wallet_revokePermissions", "params": [{"eth_accounts": {}}]});
                } 
              },
              onAuthFlowOpen: () => {
                const depositBox = document.getElementsByClassName("deposit-container")[0] as HTMLElement;
                depositBox.style.transform = "scale(0.9)";

                const submitButton = document.getElementsByClassName("submit-button")[0] as HTMLElement;
                if (submitButton) submitButton.className += " disabled";

                const mainContent = document.getElementById("main-content") as HTMLElement;
                mainContent.style.filter = "blur(3px)"
            },
            onAuthFlowClose: () => {
                const depositBox = document.getElementsByClassName("deposit-container")[0] as HTMLElement;
                depositBox.style.transform = "scale(1)";

                const submitButton = document.getElementsByClassName("submit-button")[0] as HTMLElement;
                if (submitButton) submitButton.className = submitButton.className.replace("disabled", "");

                const mainContent = document.getElementById("main-content") as HTMLElement;
                mainContent.style.filter = ""
            }
          },
          walletsFilter: (wallets) => wallets.filter((w) => w.walletConnector.supportedChains.includes("EVM") || eclipseWallets.includes(w.key)),
          mobileExperience: "redirect", 
          environmentId: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || '',
          walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
          initialAuthenticationMode: 'connect-only',
          displaySiweStatement: true,
          privacyPolicyUrl: "https://www.eclipse.xyz/privacy-policy",
          termsOfServiceUrl: "https://www.eclipse.xyz/terms",
          overrides: {
            ...(process.env.NEXT_PUBLIC_CURRENT_CHAIN === 'sepolia' && { evmNetworks: evmNetworks }),
            chainDisplayValues: {
           }
          },
          cssOverrides,
          bridgeChains: [
            ...(isMobile ? [] : [{ chain: "EVM"}, { chain: "SOL" }]) as [{ chain: "EVM"}, { chain: "SOL"}]
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
