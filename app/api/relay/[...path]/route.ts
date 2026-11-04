import { NextRequest, NextResponse } from 'next/server';

// Proxies the Relay API so RELAY_API_KEY stays server-side. relay-kit sends
// every call through `baseApiUrl`, which RelayKitProvider points here.
const RELAY_API = 'https://api.relay.link';

// Only what the swap widget and our Activity tab use. Integrator-only
// endpoints (fast-fill, app-fees, claim) are deliberately left out.
const ALLOWED_PATH_PREFIXES = [
    'chains',
    'currencies/',
    'quote/',
    'execute',
    'requests/',
    'intents/status/',
    'transactions/',
    'transaction/',
];

const FORWARDED_HEADERS = ['content-type', 'accept'];

// Every visitor shares our key's rate limits (/requests/* is the tightest), so
// cache the GETs that are safe to serve slightly stale. Next only caches 200s.
const CACHE_TTL_SECONDS: [string, number][] = [
    ['chains', 3600],
    ['requests/v3', 60],
];

function cacheTtlFor(url: URL, method: string) {
    if (method !== 'GET') return undefined;
    return CACHE_TTL_SECONDS.find(([path]) => url.pathname === `/${path}`)?.[1];
}

// Check the URL we'll actually fetch: fetch normalizes `..` segments, so
// matching the raw path would let `chains/../admin` escape the allowlist.
function relayUrlFor(path: string, search: string): URL | null {
    const url = new URL(`${RELAY_API}/${path}${search}`);
    if (url.origin !== RELAY_API) return null;
    const normalized = url.pathname.slice(1);
    const allowed = ALLOWED_PATH_PREFIXES.some((prefix) =>
        prefix.endsWith('/')
            ? normalized.startsWith(prefix)
            : normalized === prefix || normalized.startsWith(`${prefix}/`)
    );
    return allowed ? url : null;
}

// Browsers omit Origin on same-origin GETs, so fall back to Sec-Fetch-Site.
// This only stops other sites from using our key via a visitor's browser.
function isSameOrigin(request: NextRequest) {
    const origin = request.headers.get('origin');
    if (origin) {
        try {
            return new URL(origin).host === request.headers.get('host');
        } catch {
            return false;
        }
    }
    return request.headers.get('sec-fetch-site') === 'same-origin';
}

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const relayUrl = relayUrlFor((await params).path.join('/'), request.nextUrl.search);
    if (!relayUrl || !isSameOrigin(request)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const apiKey = process.env.RELAY_API_KEY || '';
    if (!apiKey) {
        return NextResponse.json({ message: 'Relay API key is not configured' }, { status: 500 });
    }

    const headers = new Headers({ 'x-api-key': apiKey });
    for (const name of FORWARDED_HEADERS) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }

    const ttl = cacheTtlFor(relayUrl, request.method);

    try {
        const response = await fetch(relayUrl, {
            method: request.method,
            headers,
            body: request.method === 'POST' ? await request.text() : undefined,
            ...(ttl ? { next: { revalidate: ttl } } : { cache: 'no-store' }),
        });

        return new NextResponse(await response.text(), {
            status: response.status,
            headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
        });
    } catch (error) {
        console.error('Relay proxy request failed:', error);
        return NextResponse.json({ message: 'Relay API unavailable' }, { status: 502 });
    }
}

export { proxy as GET, proxy as POST };
