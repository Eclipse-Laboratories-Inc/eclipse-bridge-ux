import { OptionsLower } from '@/lib/networkUtils';
import { NextRequest, NextResponse } from 'next/server';

const CACHE_EXPIRATION_MS = 10000; // 10 seconds cache

interface ICache  {
    blockNumber: number | null;
    gasPrice: number | null;
    ethPrice: number | null;
    timestamp: number | null;
    network: OptionsLower | null
}

let cache: ICache = {
    blockNumber: null,
    gasPrice: null,
    ethPrice: null,
    timestamp: null,
    network: null
};

let isFetching = false;

const ETHERSCAN_API_URLS: Record<OptionsLower, string> = {
    'mainnet': "https://api.etherscan.io/v2/api",
    'testnet': "https://api.etherscan.io/v2/api"
}

function isValidChain(c: string): c is OptionsLower {
    return c in ETHERSCAN_API_URLS
}

// Retries once on a network-level failure. Etherscan occasionally closes a
// pooled keep-alive connection just as undici reuses it ("fetch failed" /
// UND_ERR_SOCKET "other side closed"); a fresh attempt succeeds. These are
// idempotent GETs, so retrying is safe.
async function fetchJsonWithRetry(url: string): Promise<any> {
    try {
        return await (await fetch(url, { cache: "no-store" })).json();
    } catch (error) {
        if (!(error instanceof TypeError)) throw error; // network errors only
        return await (await fetch(url, { cache: "no-store" })).json();
    }
}

const hasCachedData = () => !!(cache.blockNumber && cache.gasPrice && cache.ethPrice);

export async function GET(request: NextRequest) {
    const apiKey = process.env.ETHERSCAN_API_KEY || "";
    
    if (!apiKey) {
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    const chain = request.nextUrl.searchParams.get('chain')?.toLowerCase()
    const parsedChain: OptionsLower = !!chain && isValidChain(chain) ? chain : 'mainnet'
    const etherscanAddress = ETHERSCAN_API_URLS[parsedChain]

    const now = new Date().getTime();
    if (cache.timestamp && (now - cache.timestamp) < CACHE_EXPIRATION_MS && cache.network === parsedChain) {
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

        const [blockData, gasData, priceData] = await Promise.all([
            fetchJsonWithRetry(`${etherscanAddress}?chainid=1&module=proxy&action=eth_blockNumber&apikey=${apiKey}`),
            fetchJsonWithRetry(`${etherscanAddress}?chainid=1&module=proxy&action=eth_gasPrice&apikey=${apiKey}`),
            fetchJsonWithRetry(`${etherscanAddress}?chainid=1&module=stats&action=ethprice&apikey=${apiKey}`)
        ]);

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
            network: parsedChain
        };

        return NextResponse.json(cache);
    } catch (error) {
        // Serve the last good values if we have them: they're at most a few
        // polls old, and the client discards non-200 responses anyway.
        if (hasCachedData()) {
            console.warn('Etherscan fetch failed, serving last known data:', (error as Error)?.message);
            return NextResponse.json(cache);
        }
        console.error('Error fetching Ethereum data:', error);
        return NextResponse.json({ error: 'Failed to fetch Ethereum data' }, { status: 500 });
    } finally {
        isFetching = false;
    }
}
