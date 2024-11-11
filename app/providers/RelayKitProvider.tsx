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
    default: "rgb(161, 254, 160)",
    subtle: "rgba(255, 255, 255, 0.3)",
  },
  buttons: {
    primary: {
      color: "rgb(161, 254, 160)",
      background: "rgba(161, 254, 160, 0.05)",
      hover: {
        color: "rgb(161, 254, 160)",
        background: "rgba(161, 254, 160, 0.1)",
      },
    },
    secondary: {
      color: "rgb(161, 254, 160)",
      background: "rgba(161, 254, 160, 0.1)",
      hover: {
        color: "rgb(161, 254, 160)",
        background: "rgba(161, 254, 160, 0.1)",
      },
    },
  },
  widget: {
    swapCurrencyButtonBorderColor: "rgba(255, 255, 255, 0.1)",
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
