"use client";
import { useMemo, type ReactNode } from "react";
import useEthereumData from "@/lib/ethUtils";
import { Options } from "@/lib/networkUtils";
import { EthereumDataContext, type DataArray } from "@/app/context";

// Owns the 10 s Ethereum data polling so that each update re-renders only the
// components that read EthereumDataContext. `children` is created by the page,
// so it keeps the same identity when this provider's state changes.
export function EthereumDataProvider({
  chain,
  children,
}: {
  chain: Options;
  children: ReactNode;
}) {
  const { gasPrice, ethPrice, blockNumber } = useEthereumData(chain);
  const value = useMemo<DataArray>(
    () => [gasPrice, ethPrice, blockNumber],
    [gasPrice, ethPrice, blockNumber],
  );

  return (
    <EthereumDataContext.Provider value={value}>
      {children}
    </EthereumDataContext.Provider>
  );
}
