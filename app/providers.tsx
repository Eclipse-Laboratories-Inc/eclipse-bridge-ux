"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { TransactionProvider } from './components/TransactionPool';
import { NetworkProvider } from "@/app/contexts/NetworkContext";


export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
            {props.children}
        </NetworkProvider>
      </QueryClientProvider>
  );
}
