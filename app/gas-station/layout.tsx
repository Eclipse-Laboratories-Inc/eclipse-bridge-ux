"use client";
import "@/app/globals.css";
import {
  DynamicContextProvider,
} from "@/lib/dynamic";
import { EclipseWalletConnectors } from "@dynamic-labs/eclipse";
import { IBM_Plex_Sans } from "next/font/google";
import { GasProviders } from "@/app/providers/GasProviders";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// TODO: maybe we can read it from a file
const cssOverrides = `
  @media (min-width: 640px) { 
    .modal {
      margin-left: var(--sidebar-width);
    }
  }

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
`;

const eclipseWallets = ["backpacksol", "nightlysol"];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <DynamicContextProvider
        settings={{
          events: {
            onAuthFlowOpen: () => {
              const depositBox = document.getElementsByClassName(
                "deposit-container",
              )[0] as HTMLElement;
              depositBox.style.transform = "scale(0.9)";

              const mainContent = document.getElementById(
                "main-content",
              ) as HTMLElement;
              mainContent.style.filter = "blur(3px)";
            },
            onAuthFlowClose: () => {
              const depositBox = document.getElementsByClassName(
                "deposit-container",
              )[0] as HTMLElement;
              depositBox.style.transform = "";

              const mainContent = document.getElementById(
                "main-content",
              ) as HTMLElement;
              mainContent.style.filter = "";
            },
            onWalletAdded: (args) => {
              if (args.wallet.key.includes("backpack")) {
                //@ts-ignore
                window.backpack.connect({
                  //@ts-ignore
                  chainGenesisHash: "EAQLJCV2mh23BsK2P9oYpV5CHVLDNHTxY",
                });
              }
            },
          },
          environmentId: process.env.NEXT_PUBLIC_ENVIRONMENT_ID || "",
          walletConnectors: [EclipseWalletConnectors],
          mobileExperience: "redirect",
          recommendedWallets: [
            { walletKey: "backpackeclipse", label: "Recommended" },
          ],
          initialAuthenticationMode: "connect-only",
          displaySiweStatement: true,
          privacyPolicyUrl: "https://www.eclipse.xyz/privacy-policy",
          termsOfServiceUrl: "https://www.eclipse.xyz/terms",
          overrides: {
            chainDisplayValues: {
              solana: {
                displayName: "Eclipse",
              },
            },
          },
          cssOverrides,
        }}
      >
        <GasProviders>
          <body className={ibmPlexSans.className}>{children}</body>
        </GasProviders>
      </DynamicContextProvider>
    </html>
  );
}
