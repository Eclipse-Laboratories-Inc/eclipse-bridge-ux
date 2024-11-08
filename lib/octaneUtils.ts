const OCTANE_BASE_ADDRESS = "https://octane-server-alpha.vercel.app/api"

export async function createOctaneSwapTransaction(user: string, tokenMint: string, amount: number) {
  const response = await fetch(`${OCTANE_BASE_ADDRESS}/buildWhirlpoolsSwap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      user: user,
      sourceMint: tokenMint,
      amount: amount,
      slippingTolerance: 1
    }),
  });
  
  return response.json()
}

export async function fetchOctaneConfig() {
  const response = await fetch(`${OCTANE_BASE_ADDRESS}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json()
}

