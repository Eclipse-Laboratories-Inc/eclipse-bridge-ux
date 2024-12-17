import { useContext } from "react";
import { WalletFilterContext } from "@/app/providers/WalletFilterProvider";

export const useWalletFilter = () => {
  const context = useContext(WalletFilterContext);
  if (!context) {
    throw new Error(
      "useWalletFilter must be used within a WalletFilterContext"
    );
  }
  return context;
};
