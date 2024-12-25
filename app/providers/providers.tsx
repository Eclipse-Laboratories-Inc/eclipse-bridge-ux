"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
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
          <BrowserRouter>
            <SidebarProvider>{props.children}</SidebarProvider>
          </BrowserRouter>
        </WalletFilterProvider>
      </QueryClientProvider>
    </RelayKitProvider>
  );
}
