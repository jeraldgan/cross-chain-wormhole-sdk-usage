import {
  amount,
  Chain,
  isTokenId,
  Network,
  TokenId,
  TokenTransfer,
  toNative,
  Wormhole,
  wormhole,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import "dotenv/config";
import { getSigner, SignerStuff, waitLog } from "./helpers/helpers";

async function tokenTransfer<N extends Network>(
  wh: Wormhole<N>,
  route: {
    token: TokenId;
    amount: bigint;
    source: SignerStuff<N, Chain>;
    destination: SignerStuff<N, Chain>;
    delivery?: {
      automatic: boolean;
      nativeGas?: bigint;
    };
    payload?: Uint8Array;
  },
  roundTrip?: boolean
): Promise<TokenTransfer<N>> {
  // EXAMPLE_TOKEN_TRANSFER
  // Create a TokenTransfer object to track the state of the transfer over time
  const xfer = await wh.tokenTransfer(
    route.token,
    route.amount,
    route.source.address,
    route.destination.address,
    route.delivery?.automatic ?? false,
    route.payload,
    route.delivery?.nativeGas
  );

  console.log("xfer", xfer.transfer);

  const quote = await TokenTransfer.quoteTransfer(
    wh,
    route.source.chain,
    route.destination.chain,
    xfer.transfer
  );
  console.log(quote);

  if (xfer.transfer.automatic && quote.destinationToken.amount < 0)
    throw "The amount requested is too low to cover the fee and any native gas requested.";

  // 1) Submit the transactions to the source chain, passing a signer to sign any txns
  console.log("Starting transfer");
  const srcTxids = await xfer.initiateTransfer(route.source.signer);
  console.log(`Started transfer: `, srcTxids);

  // If automatic, we're done
  if (route.delivery?.automatic) return xfer;

  // 2) Wait for the VAA to be signed and ready (not required for auto transfer)
  console.log("Getting Attestation");
  const attestIds = await xfer.fetchAttestation(60 * 1000 * 30);
  console.log(`Got Attestation: `, attestIds);

  // 3) Redeem the VAA on the dest chain
  console.log("Completing Transfer");
  const destTxids = await xfer.completeTransfer(route.destination.signer);
  console.log(`Completed Transfer: `, destTxids);
  // EXAMPLE_TOKEN_TRANSFER

  // If no need to send back, dip
  if (!roundTrip) return xfer;

  const { destinationToken: token } = quote;
  return await tokenTransfer(wh, {
    ...route,
    token: token.token,
    amount: token.amount,
    source: route.destination,
    destination: route.source,
  });
}

async function sendToken(tokenAddress: string) {
  const wh = await wormhole("Testnet", [evm, solana]);
  const srcChain = wh.getChain("Sepolia");
  const targetChain = wh.getChain("Solana");
  const srcSigner = await getSigner(srcChain);
  const targetSigner = await getSigner(targetChain);
  const tokenBridge = await targetChain.getTokenBridge();
  const wrappedAsset = await tokenBridge.getWrappedAsset({
    chain: "Sepolia",
    address: toNative("Sepolia", tokenAddress),
  });

  const token = Wormhole.tokenId(srcChain.chain, tokenAddress);

  console.log("Native Token: ", token);

  const decimals = isTokenId(token)
    ? Number(await wh.getDecimals(token.chain, token.address))
    : srcChain.config.nativeTokenDecimals;

  console.log("Decimals: ", decimals);
  // Set this to true if you want to perform a round trip transfer
  const roundTrip: boolean = false;

  let recoverTxid = undefined;
  const automatic = false;
  // // recoverTxid = "0xa4e0a2c1c994fe3298b5646dfd5ce92596dc1a589f42e241b7f07501a5a5a39f";

  console.log("Amount: ", amount.units(amount.parse(1, decimals)));

  const nativeGas = automatic ? "0.01" : undefined;

  // // Finally create and perform the transfer given the parameters set above
  const xfer = await tokenTransfer(
    wh,
    {
      token: token,
      amount: amount.units(amount.parse(2, decimals)),
      source: srcSigner,
      destination: targetSigner,
      delivery: {
        automatic,
        nativeGas: undefined,
      },
    },
    roundTrip
  );

  const receipt = await waitLog(wh, xfer);

  // // // Log out the results
  console.log(receipt);
}

// Usage
async function main() {
  await sendToken("0xbF65515680C18661370642287ce658B0137f6B6F");
}

main();
