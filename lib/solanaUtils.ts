const solanaWeb3 = require('@solana/web3.js');

export async function getWalletBalance(publicKey: String) {
  // Connect to the Solana mainnet
  const connection = new solanaWeb3.Connection(
    'https://mainnetbeta-rpc.eclipse.xyz',
    'confirmed'
  );

  // Fetch the balance
  const balance = await connection.getBalance(new solanaWeb3.PublicKey(publicKey));

  // Convert balance from lamports to SOL (1 SOL = 10^9 lamports)
  return balance / solanaWeb3.LAMPORTS_PER_SOL;
}
