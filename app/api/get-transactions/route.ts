import { NextResponse } from 'next/server';

const API_KEY = process.env.ETHERSCAN_API_KEY || '';
const ETHERSCAN_API = 'https://api.etherscan.io/v2/api';
// [chainId, bridge contracts (v1 legacy, v3), start block]
const chains: { [key: string]: [number, string[], string] } = {
  mainnet: [1       , ['0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11', '0x504392F02ee64D6B51aD3bCf7999E69EBe28b30a'], "21126289"],
  testnet: [11155111, ['0xe49aaa25a10fd6e15dd7ddcb50904ca1e91f6e01', '0x6f3A89b6cd44b814c35964bb22541EF20D756c33'], "7025169"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  console.log(chain, "chain")
  if (!chain || !chains[chain]) {
    return NextResponse.json({ message: 'Invalid chain' }, { status: 400 });
  }

  if (!address || typeof address !== 'string') {
    return NextResponse.json({ message: 'Address is required' }, { status: 400 });
  }
  const [chainId, bridgeContracts, startBlock] = chains[chain];

  try {
    const apiUrl = `${ETHERSCAN_API}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&page=1&offset=1000&sort=desc&apikey=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === '0' && data.message === 'No transactions found') {
      return NextResponse.json([]);
    }
    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch data from Etherscan');
    }

    const deposits = data.result
      .filter(
        (tx: any) => 
          bridgeContracts.some((c) => c.toLowerCase() === tx.to?.toLowerCase()) &&
          tx.methodId	=== '0x1de26e16'
      );

    // TODO: remove this
    return NextResponse.json(deposits.slice(0, 5));
  } catch (error) {
    console.error('Error fetching last deposits:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
