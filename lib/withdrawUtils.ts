import * as anchor from "@project-serum/anchor";
import { Program, Provider } from "@coral-xyz/anchor";
import { CanonicalBridge } from "./canonical_bridge";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./canonical_bridge.json";

export async function callExampleFunction(wallet: any) {
  const signer = await wallet;
  const connection = new Connection("https://testnet.dev2.eclipsenetwork.xyz");
  const provider = new anchor.AnchorProvider(connection, signer, {
    preflightCommitment: "processed",
  });
  anchor.setProvider(provider);
  console.log(provider)

  const program = new Program<CanonicalBridge>(idl as CanonicalBridge, provider as Provider);

  const [withdrawalReceiptPda, _withdrawalReceiptPdaBump ] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdrawal"),
        new anchor.BN(12345678999).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
  );

  console.log("gonderenzo")
  try {
    const tx = await program.methods
      .withdraw(
        "0xF04089d365F9B4Ad237E63B3b59Fc04DE0B10A34",
        new anchor.BN(12345678999),
        new anchor.BN(10**9 * 0.005)
      )
      .accounts({
        withdrawer: "J2MALbLd2ExscsWFbPmRVuoXSnewcFaW5S3VUbpVsyhV",
        //@ts-ignore
        config: "A3jHKVwNvrvTjnUPGKYei9jbPn7NcraD6H94ewWyfVMY",  // HARDCODED CONFIG ACCOUNT 
        withdrawalReceipt: withdrawalReceiptPda,
        relayer: "ec1vCnQKsQSnTbcTyc3SH2azcDXZquiFB3QqtRvm3Px"   // HARDCODED RELAYER ACCOUNT
      })
      .signers([])
      .rpc()

    console.log("Transaction Signature:", tx);
  } catch (error) {
    console.error("Transaction Error:", error);
  }
}

