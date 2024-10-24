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

export async function sendOctaneSwapTransaction(tx: string, messageToken: string) {
  const response = await fetch("https://octane.namascan.com/api/sendWhirlpoolsSwap", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      transaction: tx,
      messageToken: messageToken
    }),
  });
  
  return response.json()
}

export async function fetchOctaneConfig() {
  const response = await fetch("https://octane.namascan.com/api", {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json()
}
