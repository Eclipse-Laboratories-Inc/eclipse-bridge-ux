"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import { RelayKitProvider } from "@/app/providers/RelayKitProvider";
import { RelayChain } from "@reservoir0x/relay-sdk";
import { WalletFilterProvider } from "@/app/providers/WalletFilterProvider";

export function Providers(props: {
  chains: RelayChain[];
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <RelayKitProvider chains={props.chains}>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <WalletFilterProvider>
            <SidebarProvider>{props.children}</SidebarProvider>
          </WalletFilterProvider>
        </NetworkProvider>
      </QueryClientProvider>
    </RelayKitProvider>
  );
}
