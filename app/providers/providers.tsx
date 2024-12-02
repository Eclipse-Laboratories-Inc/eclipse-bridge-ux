"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
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
        <WalletFilterProvider>
          <SidebarProvider>{props.children}</SidebarProvider>
        </WalletFilterProvider>
      </QueryClientProvider>
    </RelayKitProvider>
  );
}
