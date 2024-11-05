import { signSendWait, wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import "dotenv/config";
import { getSigner } from "./helpers/helpers";

async function submitAttestation(txId: string) {
  const wh = await wormhole("Testnet", [evm, solana]);
  const chain = wh.getChain("Solana");
  const { signer, address } = await getSigner(chain);
  const tokenBridge = await chain.getTokenBridge();
  const vaa = await wh.getVaa(txId, "TokenBridge:AttestMeta");
  if (vaa) {
    const txids = await signSendWait(
      chain,
      tokenBridge.submitAttestation(vaa, address.address),
      signer
    );
    console.log(txids);
  }
}

// Usage
async function main() {
  await submitAttestation(
    "0x51ef2c85950765e2480f396d2d9317d08426b8a83b1688b4478cb86504086e4b"
  );
}

main();
