"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTokenBalance } from "@/lib/solanaUtils"
import { useWallets } from "@/app/hooks/useWallets";
import { fetchOctaneConfig } from '@/lib/octaneUtils';

export type Token = {
  icon: string,
  symbol: "USDC" | "WIF" | "SOL" | "tETH",
  name: string,
  decimals: number,
  fee: BigInt,
  mint: string,
  balance?: bigint,
  price?: number
}

const initialTokens: Record<string, Token> = {
  USDC: { 
    name: "USD Coin", 
    symbol: 'USDC', 
    mint: "AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE",
    icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
    decimals: 6,
    fee: BigInt(0),
    balance: BigInt(0),
    price: 1
  },
  /*
  WIF: {
    name: "dogwifhat", 
    symbol: 'WIF', 
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    icon: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428',
    decimals: 6,
    fee: BigInt(0),
    balance: BigInt(0),
    price: 2.7  
  },
  */
  SOL: { 
    name: "Solana", 
    symbol: 'SOL', 
    mint: "BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL",
    icon: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756',
    decimals: 9,
    fee: BigInt(0),
    balance: BigInt(0),
    price: 180 
  },
  tETH: {
    name: "Turbo ETH", 
    symbol: 'tETH', 
    mint: "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn",
    icon: '/token-teth.svg',
    decimals: 9,
    fee: BigInt(0),
    balance: BigInt(0),
    price: 2850 
  },
};

export interface TManagerType {
  tokens: Record<string, Token>; 
}

export const TokenManagerContext = createContext<TManagerType | undefined>(undefined);

export const TMProvider = ({ children } : { children: ReactNode}) => {
  const [tokens, setTokens] = useState(initialTokens);
  const { solWallet } = useWallets(); 

  useEffect(() => {
    const getTokens = async () => {
      if (!solWallet?.address) return false;
      const balUsdc = await getTokenBalance(tokens.USDC.mint, solWallet?.address || "")
      const balSol  = await getTokenBalance(tokens.SOL.mint , solWallet?.address || "")
      const balTeth  = await getTokenBalance(tokens.tETH.mint , solWallet?.address || "")

      /*
      const connection = new Connection("https://eclipse.helius-rpc.com", "finalized");
      const solPrice = await fetchTokenPrice(connection, tokens.SOL.mint)
      */

      setTokens((prevTokens) => ({
          ...prevTokens,
          USDC: {
            ...prevTokens.USDC,
            balance: BigInt(balUsdc || 0),
          },
          SOL: {
            ...prevTokens.SOL,
            balance: BigInt(balSol || 0),
          },
          tETH: {
            ...prevTokens.tETH,
            balance: BigInt(balTeth || 0),
          }
        })); 
    }

    const fetchFeeInfo = async () => {
      const config = await fetchOctaneConfig(); 
      
      Object.values(tokens).forEach((token: Token) => {
        const matchingFee = config.endpoints.whirlpoolsSwap.tokens.find((fee: any) => fee.mint === token.mint);
          if (matchingFee) {
            token.fee = matchingFee.fee; 
          }
        });
      console.log(tokens)
    }
    
    fetchFeeInfo()
    getTokens()
    const intervalId = setInterval(getTokens, 20000);

    return () => clearInterval(intervalId);
  }, [solWallet?.address])

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

