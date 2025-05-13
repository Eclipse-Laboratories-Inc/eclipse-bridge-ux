const WAD = {
  bigint: BigInt(1e18),
  number: 1e18,
};

/**
 * Calculates the minimum mint amount after accounting for slippage.
 *
 * @param depositAmount - The amount to be deposited, represented as a bigint.
 * @param rate - The rate at which the deposit amount is converted, represented as a bigint.
 * @param mintSlippage - The slippage percentage to account for, represented as a number. Default is 0.5%.
 * @returns The minimum mint amount after slippage, represented as a bigint.
 */
export function calculateMinimumMint(
  depositAmount: bigint,
  rate: bigint,
  mintSlippage: number = 0.005 // 0.5%
): bigint {
  const slippageAsBigInt = BigInt((mintSlippage * WAD.number).toString());
  const minimumMint = (depositAmount * WAD.bigint) / rate;
  const slippageAmount = (minimumMint * slippageAsBigInt) / WAD.bigint;
  return minimumMint - slippageAmount;
}
