"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { NetworkProvider } from "@/app/contexts/NetworkContext";
import { SidebarProvider } from "@/app/contexts/SidebarContext";


export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
      <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            {props.children}
          </SidebarProvider>
      </QueryClientProvider>
  );
}
