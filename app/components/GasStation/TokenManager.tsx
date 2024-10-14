"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection } from '@solana/web3.js';
import { getTokenBalance } from "@/lib/solanaUtils"
import { fetchTokenPrice } from "@/lib/priceUtils"

export type Token = {
  icon: string,
  symbol: "USDC" | "WIF" | "SOL",
  name: string,
  decimals: number,
  mint: string,
  balance?: BigInt,
  price?: number
}

const initialTokens: Record<string, Token> = {
  USDC: { 
    name: "USD Coin", 
    symbol: 'USDC', 
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
    decimals: 6,
    balance: BigInt(14548797),
    price: 1
  },
  WIF: {
    name: "dogwifhat", 
    symbol: 'WIF', 
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    icon: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428',
    decimals: 6,
    balance: BigInt(0),
    price: 0.01 
  },
  SOL: { 
    name: "Solana", 
    symbol: 'SOL', 
    mint: "So11111111111111111111111111111111111111112",
    icon: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756',
    decimals: 9,
    balance: BigInt(2000000),
    price: 145.07
  },
};

export interface TManagerType {
  tokens: Record<string, Token>; 
}

export const TokenManagerContext = createContext<TManagerType | undefined>(undefined);

export const TMProvider = ({ children } : { children: ReactNode}) => {
  const [tokens, setTokens] = useState(initialTokens);

  useEffect(() => {
    const getTokens = async () => {
      const balUsdc = await getTokenBalance(tokens.USDC.mint, "J2MALbLd2ExscsWFbPmRVuoXSnewcFaW5S3VUbpVsyhV")
      const balWif = await getTokenBalance(tokens.WIF.mint, "J2MALbLd2ExscsWFbPmRVuoXSnewcFaW5S3VUbpVsyhV")

      /*
      const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=e0dc13bd-8a5d-424c-8895-9d26bbb1ffdb", "finalized");
      const price = await fetchTokenPrice(connection, tokens.WIF.mint)
      */
      // const response = await createOctaneSwapTransaction(); 
      // console.log(response)

      setTokens((prevTokens) => ({
          ...prevTokens,
          USDC: {
            ...prevTokens.USDC,
            balance: BigInt(balUsdc.amount),
          },
          WIF: {
            ...prevTokens.WIF,
            balance: BigInt(balWif.amount),
          }
        })); 
    }

    const intervalId = setInterval(getTokens, 10000);

    return () => clearInterval(intervalId);
  }, [tokens.USDC.mint ,tokens.WIF.mint])

  return (
    <TokenManagerContext.Provider value={{ 
        tokens
      }}>
      {children}
    </TokenManagerContext.Provider>
  );
}

export const useTransactionManager = () => {
  const context = useContext(TokenManagerContext);
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
};

