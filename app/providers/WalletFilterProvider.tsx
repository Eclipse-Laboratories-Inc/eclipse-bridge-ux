import React, { useState, ReactNode, createContext } from "react";

interface WalletFilterContextState {
  walletFilter?: "EVM" | "SOL" | "BTC" | "ECLIPSE";
  setWalletFilter: (
    value: "EVM" | "SOL" | "BTC" | "ECLIPSE" | undefined
  ) => void;
}

export const WalletFilterContext = createContext<
  WalletFilterContextState | undefined
>(undefined);

export const WalletFilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [walletFilter, setWalletFilter] = useState<
    "EVM" | "SOL" | "BTC" | "ECLIPSE" | undefined
  >(undefined);

  return (
    <WalletFilterContext.Provider value={{ walletFilter, setWalletFilter }}>
      {children}
    </WalletFilterContext.Provider>
  );
};
