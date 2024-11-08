"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import { RelayKitProvider } from "@/app/providers/RelayKitProvider";
import { WagmiProvider } from "@/app/providers/wagmiProvider";
import { RelayChain } from "@reservoir0x/relay-sdk";

export function Providers(props: {
  chains: RelayChain[];
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <RelayKitProvider chains={props.chains}>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <SidebarProvider>{props.children}</SidebarProvider>
        </NetworkProvider>
      </QueryClientProvider>
    </RelayKitProvider>
  );
}
