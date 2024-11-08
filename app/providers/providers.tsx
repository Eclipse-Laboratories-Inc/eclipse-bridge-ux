"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { TransactionProvider } from "./components/TransactionPool";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import { RelayKitProvider } from "@/app/providers/RelayKitProvider";
import { WagmiProvider } from "@/app/providers/wagmiProvider";

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider>
      {({ chains }) => {
        return (
          <RelayKitProvider chains={chains}>
            <QueryClientProvider client={queryClient}>
              <NetworkProvider>
                <SidebarProvider>{props.children}</SidebarProvider>
              </NetworkProvider>
            </QueryClientProvider>
          </RelayKitProvider>
        );
      }}
    </WagmiProvider>
  );
}
