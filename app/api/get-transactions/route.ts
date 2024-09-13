import { NextResponse } from 'next/server';

const BRIDGE_CONTRACT_ADDRESS = "0x83cb71d80078bf670b3efec6ad9e5e6407cd0fd1";
const API_KEY = process.env.ETHERSCAN_API_KEY || 'G6FW2T6RHAAHM9H5ATF8GVIFX8F4K5S38B';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || typeof address !== 'string') {
    return NextResponse.json({ message: 'Address is required' }, { status: 400 });
  }

  try {
    const apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${API_KEY}`;
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
