export async function createOctaneSwapTransaction(user: string, tokenMint: string, amount: number) {
  const response = await fetch("http://localhost:3001/api/buildWhirlpoolsSwap", {
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
  const response = await fetch("http://localhost:3001/api", {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json()
}
