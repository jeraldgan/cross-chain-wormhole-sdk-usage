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
  const vaa = await wh.getVaa(txId, "TokenBridge:AttestMeta", 60 * 1000 * 30);
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
    "0x678acfe18ca5d544d02d5158d3009ab0c89f71a6133df02ee6fe4e9fd56377cd"
  );
}

main();
