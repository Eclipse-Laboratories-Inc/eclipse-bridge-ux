import { NextResponse } from 'next/server';

const API_KEY = process.env.ETHERSCAN_API_KEY || '';
const ETHERSCAN_API = 'https://api.etherscan.io/v2/api';
// [chainId, bridge contracts (v1 legacy, v3), start block]
const chains: { [key: string]: [number, string[], string] } = {
  mainnet: [1       , ['0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11', '0x504392F02ee64D6B51aD3bCf7999E69EBe28b30a'], "21126289"],
  testnet: [11155111, ['0xe49aaa25a10fd6e15dd7ddcb50904ca1e91f6e01', '0x6f3A89b6cd44b814c35964bb22541EF20D756c33'], "7025169"],
};

// Every visitor shares one Etherscan key, so let the CDN absorb repeat
// requests (Activity polls this). The client keeps just-sent deposits
// locally until Etherscan indexes them, so 15 s of staleness is invisible.
const SUCCESS_CACHE_CONTROL = 'public, s-maxage=15, stale-while-revalidate=30';
const RATE_LIMIT_RETRY_MS = 1200;

// Etherscan reports failures as { status: "0", message: "NOTOK", result:
// "<reason>" }; the reason (e.g. "Max calls per sec rate limit reached")
// is in `result`. Its rate limit is per second, so retry that case once.
async function fetchTxlist(apiUrl: string): Promise<any> {
  const data = await (await fetch(apiUrl, { cache: 'no-store' })).json();
  if (data.status === '0' && typeof data.result === 'string' && /rate limit/i.test(data.result)) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_MS));
    return (await fetch(apiUrl, { cache: 'no-store' })).json();
  }
  return data;
}

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  // Own keys only: `chains["constructor"]` is truthy but not a chain.
  if (!chain || !Object.prototype.hasOwnProperty.call(chains, chain)) {
    return NextResponse.json({ message: 'Invalid chain' }, { status: 400 });
  }

  // Strict format check: `address` used to be interpolated raw into the
  // Etherscan URL, so a value like "0x…&page=11" (sent as %26) overrode our
  // query parameters ("Result window is too large" in production).
  if (!address || !EVM_ADDRESS.test(address)) {
    return NextResponse.json({ message: 'Invalid address' }, { status: 400 });
  }
  const [chainId, bridgeContracts, startBlock] = chains[chain];

  try {
    // URLSearchParams encodes every value, so nothing can add parameters.
    const apiUrl = `${ETHERSCAN_API}?${new URLSearchParams({
      chainid: String(chainId),
      module: 'account',
      action: 'txlist',
      address,
      startblock: startBlock,
      endblock: '99999999',
      page: '1',
      offset: '1000',
      sort: 'desc',
      apikey: API_KEY,
    })}`;
    const data = await fetchTxlist(apiUrl);

    if (data.status === '0' && data.message === 'No transactions found') {
      return NextResponse.json([], { headers: { 'Cache-Control': SUCCESS_CACHE_CONTROL } });
    }
    if (data.status !== '1') {
      // Include `result`: `message` alone is just "NOTOK".
      const reason = typeof data.result === 'string' ? `: ${data.result}` : '';
      throw new Error(`${data.message || 'Failed to fetch data from Etherscan'}${reason} (chain ${chain})`);
    }

    const deposits = data.result
      .filter(
        (tx: any) => 
          bridgeContracts.some((c) => c.toLowerCase() === tx.to?.toLowerCase()) &&
          tx.methodId	=== '0x1de26e16'
      );

    // TODO: remove this
    return NextResponse.json(deposits.slice(0, 5), { headers: { 'Cache-Control': SUCCESS_CACHE_CONTROL } });
  } catch (error) {
    console.error('Error fetching last deposits:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
