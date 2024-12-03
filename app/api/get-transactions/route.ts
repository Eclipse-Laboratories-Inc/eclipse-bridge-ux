import { NextResponse } from 'next/server';

const BRIDGE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_CONTRACT || '';
const API_KEY = process.env.ETHERSCAN_API_KEY || '';

interface EtherscanTransaction {
  to: string;
  from: string;
  hash: string;
  blockNumber: string;
  timeStamp: string;
  value: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || typeof address !== 'string') {
    return NextResponse.json({ message: 'Address is required' }, { status: 400 });
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_ETHERSCAN_ADDRESS}?module=account&action=txlist&address=${address}&startblock=21126289&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch data from Etherscan');
    }

    const deposits = data.result
      .filter((tx: EtherscanTransaction) => tx.to.toLowerCase() === BRIDGE_CONTRACT_ADDRESS.toLowerCase());

    return NextResponse.json(deposits);
  } catch (error) {
    console.error('Error fetching last deposits:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
