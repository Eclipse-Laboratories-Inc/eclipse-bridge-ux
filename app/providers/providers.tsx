"use client";

import { RelayKitProvider } from "@/app/providers/RelayKitProvider";
import { WagmiProvider } from "@/app/providers/wagmiProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider>
      {({ chains }) => {
        return (
          <RelayKitProvider chains={chains}>
            <QueryClientProvider client={queryClient}>
              {props.children}
            </QueryClientProvider>
          </RelayKitProvider>
        );
      }}
    </WagmiProvider>
  );
}
