import { NextResponse } from 'next/server';

const BRIDGE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_CONTRACT || '';
const API_KEY = process.env.ETHERSCAN_API_KEY || '';
// Starting block to search for transactions
const START_BLOCK = 21126289;

// Define an interface for a transaction
interface Transaction {
    to: string;
    from: string;
    hash: string;
    blockNumber: string;
    // Add other necessary fields as needed
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address || typeof address !== 'string') {
        return NextResponse.json({ message: 'Address is required' }, { status: 400 });
    }

    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_ETHERSCAN_ADDRESS}?module=account&action=txlist&address=${address}&startblock=${START_BLOCK}&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${API_KEY}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch data from Etherscan API');
        }

        const data = await response.json();

        if (data.status !== '1') {
            throw new Error(data.message || 'Failed to fetch data from Etherscan');
        }

        const deposits = data.result
            .filter((tx: Transaction) => tx.to.toLowerCase() === BRIDGE_CONTRACT_ADDRESS.toLowerCase());

        return NextResponse.json(deposits);
    } catch (error) {
        console.error('Error fetching last deposits:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}
