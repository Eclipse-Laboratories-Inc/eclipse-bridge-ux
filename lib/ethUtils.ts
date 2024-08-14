import { useState, useEffect } from 'react';

interface Icache  {
    blockNumber: number | null,
    gasPrice: number | null,
    ethPrice: number | null,
    timestamp: number | null,
};
const cache: Icache = {
    blockNumber: null,
    gasPrice: null,
    ethPrice: null,
    timestamp: null,
};

const CACHE_EXPIRATION_MS = 60000; // Cache expiration time (1 minute)

const useEthereumData = () => {
    const [blockNumber, setBlockNumber] = useState<number | null>(cache.blockNumber);
    const [gasPrice, setGasPrice] = useState<number | null>(cache.gasPrice);
    const [ethPrice, setEthPrice] = useState<number | null>(cache.ethPrice);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiKey = 'G6FW2T6RHAAHM9H5ATF8GVIFX8F4K5S38B';

        const fetchData = async () => {
            try {
                const now = new Date().getTime();

                if (cache.timestamp && now - cache.timestamp < CACHE_EXPIRATION_MS) {
                    // Use cached data if within expiration time
                    setBlockNumber(cache.blockNumber);
                    setGasPrice(cache.gasPrice);
                    setEthPrice(cache.ethPrice);
                    return;
                }

                console.log('Fetching Ethereum data...');
                const [blockResponse, gasResponse, priceResponse] = await Promise.all([
                    fetch(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`),
                    fetch(`https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=${apiKey}`),
                    fetch(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${apiKey}`)
                ]);

                const blockData = await blockResponse.json();
                const gasData = await gasResponse.json();
                const priceData = await priceResponse.json();

                const newBlockNumber = parseInt(blockData.result, 16);
                const newGasPrice = parseInt(gasData.result, 16) / 1e9; // Convert to Gwei
                const newEthPrice = parseFloat(priceData.result.ethusd);
                if (!newBlockNumber || !newGasPrice || !newEthPrice) {
                  setError('Failed to fetch Ethereum data');
                  return;
                }

                // Update state with new data
                setBlockNumber(newBlockNumber);
                setGasPrice(Math.round(newGasPrice * 100) / 100);
                setEthPrice(Math.round(newEthPrice * 100) / 100);

                // Update cache
                cache.blockNumber = newBlockNumber;
                cache.gasPrice = Math.round(newGasPrice * 100) / 100;
                cache.ethPrice = Math.round(newEthPrice * 100) / 100;
                cache.timestamp = now;

            } catch (err) {
                setError('Failed to fetch Ethereum data');
            }
        };

        fetchData();
    }, []);

    return { blockNumber, gasPrice, ethPrice, error };
};

export default useEthereumData;
