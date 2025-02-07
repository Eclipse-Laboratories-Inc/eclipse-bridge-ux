"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import { WagmiProvider } from "@/app/providers/wagmiProvider";

export function GasProviders(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider>
      {() => {
        return (
          <QueryClientProvider client={queryClient}>
            <SidebarProvider>{props.children}</SidebarProvider>
          </QueryClientProvider>
        );
      }}
    </WagmiProvider>
  );
}
