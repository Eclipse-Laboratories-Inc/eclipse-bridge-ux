import * as anchor from "@project-serum/anchor";
import { Program, Provider } from "@coral-xyz/anchor";
import { CanonicalBridge } from "./canonical_bridge";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./canonical_bridge.json";

export async function withdrawEthereum(
  wallet: any,
  receiver: string,
  eclipseRpc: string,
  configAccount: string,
  relayer: string,
  programId: string
) {
  const signer = await wallet;
  alert(eclipseRpc)
  alert(programId)
  const connection = new Connection(eclipseRpc);
  const provider = new anchor.AnchorProvider(connection, signer, {
    preflightCommitment: "processed",
  });
  anchor.setProvider(provider);
  console.log(provider)

  const program = new Program<CanonicalBridge>(idl as CanonicalBridge, provider as Provider);
  const bridgeProgram = new PublicKey(programId);
  // program.programId = bridgeProgram;

  const randomNonce = Math.floor(Math.random() * 10**12);
  const [withdrawalReceiptPda, _withdrawalReceiptPdaBump ] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdrawal"),
        new anchor.BN(randomNonce).toArrayLike(Buffer, "le", 8),
      ],
      bridgeProgram 
  );

  try {
    const tx = await program.methods
      .withdraw(
        receiver,
        new anchor.BN(randomNonce), 
        new anchor.BN(10**9 * 0.005)
      )
      .accounts({
        withdrawer: signer.publicKey.toBase58(),
        //@ts-ignore
        config: configAccount,  // HARDCODED CONFIG ACCOUNT 
        withdrawalReceipt: withdrawalReceiptPda,
        relayer: relayer   // HARDCODED RELAYER ACCOUNT
      })
      .signers([])
      .rpc()

    console.log("Transaction Signature:", tx);
    return tx
  } catch (error) {
    console.error("Transaction Error:", error);
    throw error;
  }
}

