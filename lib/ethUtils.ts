import { useState, useEffect } from 'react';
import { Options, toOptionsLower } from './networkUtils';

interface IEthereumData {
    blockNumber: number | null;
    gasPrice: number | null;
    ethPrice: number | null;
}

const CACHE_EXPIRATION_MS = 10000; // Cache expiration time (30 sec)

let cache: IEthereumData & { timestamp: number | null } = {
    blockNumber: null,
    gasPrice: null,
    ethPrice: null,
    timestamp: null,
};

const useEthereumData = (chain: Options) => {
    const [blockNumber, setBlockNumber] = useState<number | null>(cache.blockNumber);
    const [gasPrice, setGasPrice] = useState<number | null>(cache.gasPrice);
    const [ethPrice, setEthPrice] = useState<number | null>(cache.ethPrice);
    const [error, setError] = useState<string | null>(null);
    const [[intervalOption, intervalId], setIntervalMeta] = useState<[Options, NodeJS.Timeout | undefined]>([chain, undefined])
    
    useEffect(() => {
        if (intervalId === undefined || chain !== intervalOption) {
            if (intervalId !== undefined) {
                clearInterval(intervalId)
            }

            const chainLower = toOptionsLower(chain)
            
            const fetchData = async () => {
                try {
                    const now = new Date().getTime();
                    if (cache.timestamp && now - cache.timestamp < CACHE_EXPIRATION_MS) {
                        setBlockNumber(cache.blockNumber);
                        setGasPrice(cache.gasPrice);
                        setEthPrice(cache.ethPrice);
                        return;
                    }
    
                    console.log('Fetching Ethereum data...');
                    const response = await fetch(`/api/ethereum-data?chain=${chainLower}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch Ethereum data');
                    }
    
                    const data: IEthereumData = await response.json();
    
                    if (!data.blockNumber || !data.gasPrice || !data.ethPrice) {
                        setError('Failed to fetch Ethereum data');
                        return;
                    }
                    setBlockNumber(data.blockNumber);
                    setGasPrice(data.gasPrice);
                    setEthPrice(data.ethPrice);
    
                    cache = {
                        ...data,
                        timestamp: now,
                    };
                } catch (err) {
                    setError('Failed to fetch Ethereum data');
                }
            };
    
            fetchData();

            const interval = setInterval(fetchData, CACHE_EXPIRATION_MS);
            setIntervalMeta([chain, interval])
        }

        // return () => {
        //     clearInterval(intervalId)
        //     setIntervalMeta([chain, undefined])
        // }
    }, [chain, intervalOption, intervalId]);

    return { blockNumber, gasPrice, ethPrice, error };
};

export default useEthereumData;
