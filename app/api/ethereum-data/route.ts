import { OptionsLower } from '@/lib/networkUtils';
import { NextRequest, NextResponse } from 'next/server';

const CACHE_EXPIRATION_MS = 10000; // 10 seconds cache

interface ICache  {
    blockNumber: number | null;
    gasPrice: number | null;
    ethPrice: number | null;
    timestamp: number | null;
}

let cache: ICache = {
    blockNumber: null,
    gasPrice: null,
    ethPrice: null,
    timestamp: null,
};

let isFetching = false;

const ETHERSCAN_API_URLS: Record<OptionsLower, string> = {
    'mainnet': "https://api.etherscan.io/api",
    'testnet': "https://api-sepolia.etherscan.io/api"
}

function isValidChain(c: string): c is OptionsLower {
    return c in ETHERSCAN_API_URLS
}

export async function GET(request: NextRequest) {
    const apiKey = process.env.ETHERSCAN_API_KEY || "";
    
    if (!apiKey) {
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    const chain = request.nextUrl.searchParams.get('chain')?.toLowerCase()
    const etherscanAddress = !!chain && isValidChain(chain) ? ETHERSCAN_API_URLS[chain] : ETHERSCAN_API_URLS['mainnet'];

    const now = new Date().getTime();
    if (cache.timestamp && (now - cache.timestamp) < CACHE_EXPIRATION_MS) {
        console.log("Using cached data");
        return NextResponse.json(cache);
    }

    if (isFetching) {
        console.log("Fetch already in progress, returning last known data");
        return NextResponse.json(cache);
    }

    try {
        isFetching = true;
        console.log("Fetching new data from Etherscan");

        const [blockResponse, gasResponse, priceResponse] = await Promise.all([
            fetch(`${etherscanAddress}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`, {cache: "no-store"}),
            fetch(`${etherscanAddress}?module=proxy&action=eth_gasPrice&apikey=${apiKey}`, {cache: "no-store"}),
            fetch(`${etherscanAddress}?module=stats&action=ethprice&apikey=${apiKey}`, {cache: "no-store"})
        ]);

        const blockData = await blockResponse.json();
        const gasData = await gasResponse.json();
        const priceData = await priceResponse.json();

        const parsedGasPrice = parseInt(gasData.result, 16) / 10**9
        const gasDecimals  = parsedGasPrice < 1 ? 10**4 : 10**2 // if gas price is less than 1 gwei, read 4 decimals; testnet edge case
        const newGasPrice = Math.round((parseInt(gasData.result, 16) / 1e9) * gasDecimals) / gasDecimals; 
        const newBlockNumber = parseInt(blockData.result, 16);
        const newEthPrice = Math.round(parseFloat(priceData.result.ethusd) * 100) / 100;

        if (!newBlockNumber || !newGasPrice || !newEthPrice) {
            return NextResponse.json(cache);
        }

        cache = {
            blockNumber: newBlockNumber,
            gasPrice: newGasPrice,
            ethPrice: newEthPrice,
            timestamp: now,
        };

        return NextResponse.json(cache);
    } catch (error) {
        console.error('Error fetching Ethereum data:', error);
        return NextResponse.json(cache || { error: 'Failed to fetch Ethereum data' }, { status: 500 });
    } finally {
        isFetching = false;
    }
}
