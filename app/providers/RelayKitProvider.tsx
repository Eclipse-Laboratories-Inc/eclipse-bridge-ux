"use client";
import { MAINNET_RELAY_API, RelayChain } from "@reservoir0x/relay-sdk";
import {
  RelayKitProvider as _RelayKitProvider,
  RelayKitTheme,
} from "@reservoir0x/relay-kit-ui";
import { type ReactNode } from "react";
const theme: RelayKitTheme = {
  font: "var(--font-ibm-pex-sans)",
  primaryColor: "rgb(161, 254, 160)",
  focusColor: "rgb(161, 254, 160)",
  text: {
    default: "#fff",
    subtle: "rgba(255, 255, 255, 0.3)",
  },
  buttons: {
    primary: {
      color: "#000",
      background: "rgb(163, 255, 165)",
      hover: {
        color: "#000",
        background: "rgb(116, 255, 113)",
      },
    },
    secondary: {
      color: "#fff",
      background: "rgb(28, 28, 28)",
      hover: {
        color: "#fff",
        background: "rgb(35, 35, 35)",
      },
    },
  },
  anchor: {
    color: "rgba(255, 255, 255, 0.3)",
    hover: {
      color: "rgba(255, 255, 255, 0.6)",
    },
  },
  widget: {
    swapCurrencyButtonBorderColor: "rgba(30, 30, 30, 1)",
    swapCurrencyButtonBorderRadius: "100%",
    swapCurrencyButtonBorderWidth: "1px",
    background: "rgba(13, 13, 13, 1)",
    borderRadius: "10",
    card: {
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "10px",
      gutter: "20px",
    },
  },
};
export const RelayKitProvider = (props: {
  children: ReactNode;
  chains: RelayChain[];
}) => {
  return (
    <_RelayKitProvider
      options={{
        baseApiUrl: MAINNET_RELAY_API,
        chains: props.chains,
        pollingInterval: 3000,
        logLevel: 4,
        disablePoweredByReservoir: true,
        duneApiKey: process.env.NEXT_PUBLIC_DUNE_API_KEY,
        source: "bridge.eclipse.xyz",
        vmConnectorKeyOverrides: {
          9286185: ["backpacksol", "nightlysol"],
        },
      }}
      theme={theme}
    >
      {props.children}
    </_RelayKitProvider>
  );
};
