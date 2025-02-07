import { useWalletFilter } from "@/app/hooks/useWalletContext";
import { convertRelayChainToDynamicNetwork } from "@/lib/relay";
import { BitcoinWalletConnectors } from "@dynamic-labs/bitcoin";
import { EclipseWalletConnectors } from "@dynamic-labs/eclipse";
import { ETHERSCAN_TESTNET_URL } from "../components/constants";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import {
  DynamicContextProvider,
  FilterChain,
  mergeNetworks,
} from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { RelayChain } from "@reservoir0x/relay-sdk";
import { ReactNode, useEffect, useState } from "react";

const eclipseWallets = ["backpacksol", "nightlysol"];
const evmNetworks = [
  {
    blockExplorerUrls: [ETHERSCAN_TESTNET_URL],
    chainId: 11155111,
    chainName: "Ethereum Sepolia",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/eth.svg"],
    name: "Ethereum",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    networkId: 11155111,
    rpcUrls: ["https://sepolia.drpc.org"],
    vanityName: "Sepolia",
  },
];

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

export const DynamicProvider = (props: {
  children: ReactNode;
  chains: RelayChain[];
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { walletFilter, setWalletFilter } = useWalletFilter();

  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkWindowSize();
    window.addEventListener("resize", checkWindowSize);

    return () => window.removeEventListener("resize", checkWindowSize);
  }, []);

  return (
    <DynamicContextProvider
      settings={{
        events: {
          onWalletRemoved: (args) => {
            if (args.wallet.chain === "EVM") {
              const client: any =
                //@ts-ignore
                args.wallet.connector.getWalletClient();
              client.request({
                method: "wallet_revokePermissions",
                params: [{ eth_accounts: {} }],
              });
            }
          },
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
            setWalletFilter(undefined);
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
        walletConnectors: [
          EthereumWalletConnectors,
          EclipseWalletConnectors,
          BitcoinWalletConnectors,
        ],
        mobileExperience: "redirect",
        initialAuthenticationMode: "connect-only",
        displaySiweStatement: true,
        privacyPolicyUrl: "https://www.eclipse.xyz/privacy-policy",
        termsOfServiceUrl: "https://www.eclipse.xyz/terms",
        overrides: {
          evmNetworks: (networks) => {
            const relayNetworks = props.chains
              //@ts-ignore: todo remove when api type is updated
              .filter((chain) => chain.vmType === "evm")
              .map((chain) => {
                return convertRelayChainToDynamicNetwork(chain);
              });
            return mergeNetworks(
              evmNetworks,
              mergeNetworks(networks, relayNetworks),
            );
          },
          chainDisplayValues: {
            solana: {
              displayName: "Eclipse",
            },
          },
        },
        cssOverrides,
        bridgeChains: [
          ...((isMobile ? [] : [{ chain: "EVM" }, { chain: "ECLIPSE" }]) as [
            { chain: "EVM" },
            { chain: "ECLIPSE" },
          ]),
        ],
      }}
    >
      {props.children}
    </DynamicContextProvider>
  );
};
