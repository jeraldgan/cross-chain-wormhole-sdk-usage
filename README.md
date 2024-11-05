# Cross-Chain Token Bridge

Simple token bridge for transferring tokens between Ethereum and Solana chains.

## Setup

1. Copy `.env.example` to `.env` and fill in:

```env
ETH_PRIVATE_KEY=your_eth_private_key
SOL_PRIVATE_KEY=your_solana_private_key
```

## Usage

### 1. Create Attestation

Creates a message on the source chain that proves ownership and details of your token. This is required before bridging to verify the token's authenticity.

1. Modify `createAttestation.ts` with your token address
2. Run:

```bash
pnpm tsc
node dist/createAttestation.js
```

Save the transaction hash - you'll need it for step 2.

### 2. Submit Attestation

Registers your token on the destination chain using the proof created in step 1. This allows the bridge to mint equivalent tokens on the target chain.

1. Modify `submitAttestation.ts` with your transaction hash
2. Run:

```bash
pnpm tsc
node dist/submitAttestation.js
```

### 3. Transfer Tokens

Locks your tokens on the source chain and mints equivalent tokens on the destination chain. The bridge maintains a 1:1 ratio between chains.

```bash
pnpm tsc
node dist/sendToken.js
```

## Requirements

- Node.js 16+
- pnpm
- Ethereum wallet with funds for gas
- Solana wallet with funds for fees
- Source chain tokens to transfer

## Notes

- Wait for transaction confirmations between steps
- Keep your private keys secure
- Test with small amounts first
