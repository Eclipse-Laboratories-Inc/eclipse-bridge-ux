import { NextResponse } from 'next/server';

const API_KEY = process.env.ETHERSCAN_API_KEY || '';
const chains: { [key: string]: [string, string] } = {
  mainnet: ['https://api.etherscan.io/api'         , '0x83cB71D80078bf670b3EfeC6AD9E5E6407cD0fd1'],
  testnet: ['https://api-sepolia.etherscan.io/api' , '0x11b8db6bb77ad8cb9af09d0867bb6b92477dd68e'],
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
  const [etherscanApi, bridgeContract] = chains[chain];

  try {
    const apiUrl = `${etherscanApi}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${API_KEY}`;
    console.log(apiUrl)
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch data from Etherscan');
    }

    const deposits = data.result
      .filter((tx: any) => tx.to.toLowerCase() === bridgeContract.toLowerCase());

    // TODO: remove this
    return NextResponse.json(deposits.slice(0, 5));
  } catch (error) {
    console.error('Error fetching last deposits:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
