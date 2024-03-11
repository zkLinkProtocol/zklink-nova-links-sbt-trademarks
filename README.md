# zkLink Nova SBT NFT 2024

This guide provides step-by-step instructions for deploying Non-Fungible Tokens (NFTs) through zkSync with Hardhat using the zkLink Nova SBT NFT project.

## Prerequisites

Ensure the following prerequisites are met:

- Node.js
- npm (Node Package Manager)

## Installation

Follow these installation steps:

1. Clone the repository to your local machine:

```bash
git clone git@github.com:zkLinkProtocol/zklink-nova-links-sbt-trademarks.git
```

2. Navigate to the project directory:

```bash
cd zklink-nova-links-sbt-trademarks
```

3. Install dependencies:

```bash
npm install --force
```

4. Create an `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

## Deployment

### Configuration

Before deployment, configure the `.env` file:

- Obtain the wallet private key from Metamask and insert it into `WALLET_PRIVATE_KEY` and `WITNESS_SINGER_PRIVATE_KEY` in the `.env` file.

### Deployments

#### Deploy Nova SBT NFT

1. Run `npm run deploy`.
2. Paste the Smart Contract Address into `NOVA_NFT_CONTRACT_ADDRESS` in the `.env` file.

#### Deploy Trademark NFT

1. Execute `npm run deploy:trademark`.
2. Paste the Smart Contract Address into `TRADEMARK_CONTRACT_ADDRESS` in the `.env` file.

#### Deploy Mystery Box NFT

1. Execute `npm run deploy:box`.
2. Paste the Smart Contract Address into `BOX_CONTRACT_ADDRESS` in the `.env` file.

#### Deploy Booster NFT

1. Execute `npm run deploy:booster`
2. Paste the Smart Contract Address into `BOOSTER_CONTRACT_ADDRESS` in the `.env` file.

## Interaction Scripts

Use the following scripts for interactions:

1. Run `npm run interact` to receive one Nova SBT NFT to your wallet.
2. Execute `npm run interact:trademark` to mint 4 trademarks to your wallet.
3. Execute `npm run interact:box` to mint 12 mystery boxes to your wallet.
4. Run `npm run interact:full` to burn SBT and 4 trademarks to obtain the Full Version NFT.
5. Run `npm run interact:booster` to burn Box to obtain the Booster NFT.