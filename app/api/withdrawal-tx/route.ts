import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

// Looks up the Eclipse transaction that initiated a withdrawal, via an archive
// RPC. The public Eclipse RPCs keep only ~6 days of history, so older
// withdrawals have no signatures there. The archive URLs carry access tokens,
// so they stay server-side and this route only answers this one question
// rather than proxying arbitrary RPC calls.

// Program ids must match bridgeProgram in app/contexts/NetworkContext.tsx.
const NETWORKS = {
    mainnet: {
        rpcEnv: 'ECLIPSE_ARCHIVE_RPC_MAINNET',
        program: new PublicKey('br1xwubggTiEZ6b7iNZUwfA3psygFfaXGfZ1heaN9AW'),
    },
    testnet: {
        rpcEnv: 'ECLIPSE_ARCHIVE_RPC_TESTNET',
        program: new PublicKey('br1t2MBNdtVRZk3taADwNLt142cVNkekXe1hn3qJVYb'),
    },
} as const;
type Network = keyof typeof NETWORKS;

const U64_MAX = (BigInt(1) << BigInt(64)) - BigInt(1);

// A found initiation tx never changes, so cache it for good. "Not found" is
// expected for a few seconds after a withdrawal is sent, so cache it briefly.
const FOUND_CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000, immutable';
const NOT_FOUND_CACHE_CONTROL = 'public, s-maxage=30';

type Result = { signature: string; blockTime: number | null } | null;

// Per-instance memo on top of the CDN cache; only found results are kept.
const found = new Map<string, Result>();
const MAX_MEMO = 10_000;

function withdrawalPda(program: PublicKey, id: bigint): PublicKey {
    const nonce = Buffer.alloc(8);
    nonce.writeBigUInt64LE(id);
    return PublicKey.findProgramAddressSync([Buffer.from('withdrawal'), nonce], program)[0];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') as Network | null;
    const idParam = searchParams.get('id') ?? '';

    if (!network || !(network in NETWORKS)) {
        return NextResponse.json({ message: 'Invalid network' }, { status: 400 });
    }
    if (!/^\d{1,20}$/.test(idParam) || BigInt(idParam) > U64_MAX) {
        return NextResponse.json({ message: 'Invalid withdrawal id' }, { status: 400 });
    }

    const { rpcEnv, program } = NETWORKS[network];
    const rpcUrl = process.env[rpcEnv];
    if (!rpcUrl) {
        // The client falls back to the public RPC on any non-200.
        return NextResponse.json({ message: 'Archive RPC not configured' }, { status: 503 });
    }

    const id = BigInt(idParam);
    const key = `${network}:${id}`;
    const memo = found.get(key);
    if (memo) {
        return NextResponse.json({ transaction: memo }, { headers: { 'Cache-Control': FOUND_CACHE_CONTROL } });
    }

    try {
        const connection = new Connection(rpcUrl, 'confirmed');
        const signatures = await connection.getSignaturesForAddress(withdrawalPda(program, id));
        // Newest first. The initiation is the oldest successful one; in every
        // withdrawal checked so far it is also the only one.
        const initiation = [...signatures].reverse().find((s) => s.err === null);
        const transaction: Result = initiation
            ? { signature: initiation.signature, blockTime: initiation.blockTime ?? null }
            : null;

        if (transaction) {
            if (found.size >= MAX_MEMO) found.clear();
            found.set(key, transaction);
        }
        return NextResponse.json(
            { transaction },
            { headers: { 'Cache-Control': transaction ? FOUND_CACHE_CONTROL : NOT_FOUND_CACHE_CONTROL } },
        );
    } catch (error) {
        // Don't echo the error: RPC errors can include the tokenized URL.
        console.error(`withdrawal-tx lookup failed (${network} ${id})`);
        return NextResponse.json({ message: 'Archive RPC request failed' }, { status: 502 });
    }
}
