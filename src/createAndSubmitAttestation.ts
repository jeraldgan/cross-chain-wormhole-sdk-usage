import {
  signSendWait,
  TokenAddress,
  TransactionId,
  wormhole,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import "dotenv/config";
import { getSigner } from "./helpers/helpers";

async function createAttestation(tokenAddress: string) {
  const wh = await wormhole("Mainnet", [evm]);
  const chain = wh.getChain("Ethereum");
  const { signer } = await getSigner(chain);
  const tokenBridge = await chain.getTokenBridge();
  const attestationTx = await tokenBridge.createAttestation(
    tokenAddress as TokenAddress<"Ethereum">
  );
  let txs = await signSendWait(chain, attestationTx, signer);
  let tx = txs[txs.length - 1];

  return tx;
}

async function submitAttestation(tx: TransactionId) {
  console.log(tx.txid);
  const wh = await wormhole("Mainnet", [solana]);
  const chain = wh.getChain("Solana");
  const { signer, address } = await getSigner(chain);
  const tokenBridge = await chain.getTokenBridge();
  const vaa = await wh.getVaa(
    tx.txid,
    "TokenBridge:AttestMeta",
    60 * 1000 * 30
  );
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
  const tx = await createAttestation(
    "0x2d088660aaefd26ff9CA8dc168Bc97F85F7dc17D"
  );
  await submitAttestation(tx);
}

main();
