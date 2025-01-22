import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";

export const useWallets = () => {
  const userWallets: Wallet[] = useUserWallets() as Wallet[];
  const solWallet = userWallets.find((w) => w.chain === "ECLIPSE");
  const evmWallet = userWallets.find((w) => w.chain === "EVM");

  console.log(solWallet, "solWallet")
  return { userWallets, solWallet, evmWallet };
};
