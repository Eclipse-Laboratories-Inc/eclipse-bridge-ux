"use client";
import { RelayChain } from "@relayprotocol/relay-sdk";
import {
  RelayKitProvider as _RelayKitProvider,
  RelayKitTheme,
} from "@relayprotocol/relay-kit-ui";
import { type ReactNode } from "react";
import { relayApiUrl } from "@/lib/relay";
const theme: RelayKitTheme = {
  font: "var(--font-ibm-pex-sans)",
  primaryColor: "rgb(161, 254, 160)",
  focusColor: "rgb(161, 254, 160)",
  text: {
    default: "#fff",
    subtle: "rgba(255, 255, 255, 0.3)",
  },
  buttons: {
    disabled: {
      color: "#5a5a5a",
      background: "#0e0e0e",
    },
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
        baseApiUrl: relayApiUrl(),
        chains: props.chains,
        pollingInterval: 3000,
        logLevel: 4,
        source: "bridge.eclipse.xyz",
        vmConnectorKeyOverrides: {
          9286185: [
            "backpacksol",
            "nightlysol",
            "okxsolana",
            "bybitwalletsol",
            "bitgetwalletsol",
            "fordefisol",
            "gatewalletsol"
          ],
        },
      }}
      theme={theme}
    >
      {props.children}
    </_RelayKitProvider>
  );
};
