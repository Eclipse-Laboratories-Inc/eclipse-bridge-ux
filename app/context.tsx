import { createContext } from "react";

export type DataArray = (number | null)[] 
export const EthereumDataContext = createContext<DataArray | null>(null);
