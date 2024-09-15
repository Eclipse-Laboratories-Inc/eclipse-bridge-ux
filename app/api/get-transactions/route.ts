import { NextResponse } from 'next/server';
import config from "@/config"

const BRIDGE_CONTRACT_ADDRESS = config.bridgeContract;
const API_KEY = process.env.ETHERSCAN_API_KEY || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || typeof address !== 'string') {
    return NextResponse.json({ message: 'Address is required' }, { status: 400 });
  }

  try {
    const apiUrl = `${config.etherscanAddress}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(data.message || 'Failed to fetch data from Etherscan');
    }

    const deposits = data.result
      .filter((tx: any) => tx.to.toLowerCase() === BRIDGE_CONTRACT_ADDRESS.toLowerCase());

    return NextResponse.json(deposits);
  } catch (error) {
    console.error('Error fetching last deposits:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
