import { signSendWait, TokenAddress, wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import "dotenv/config";
import { getSigner } from "./helpers/helpers";

async function createAttestation(tokenAddress: string) {
  const wh = await wormhole("Testnet", [evm]);
  const chain = wh.getChain("Sepolia");
  const { signer, address } = await getSigner(chain);
  const tokenBridge = await chain.getTokenBridge();
  const attestationTx = await tokenBridge.createAttestation(
    tokenAddress as TokenAddress<"Ethereum">
  );
  let txids = await signSendWait(chain, attestationTx, signer);
  let txid = txids[txids.length - 1];

  console.log("txid", txid);
}

// Usage
async function main() {
  await createAttestation("0xbF65515680C18661370642287ce658B0137f6B6F");
}

main();
