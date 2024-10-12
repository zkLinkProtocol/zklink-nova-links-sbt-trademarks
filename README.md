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

5. Compile all Smart contracts

```bash
npm run compile
```

## Deployment

### Configuration

Before deployment, configure the `.env` file:

- Obtain the wallet private key from Metamask and insert it into `WALLET_PRIVATE_KEY` and `WITNESS_SINGER_PRIVATE_KEY` in the `.env` file.

### Deployments

#### Deploy Nova SBT NFT

1. Run `npm run deploy`.

```bash
npm run deploy

> deploy
> npx hardhat deploy-zksync --script nft/deploy.ts

Starting deployment process of "NovaNFT"...
rpcUrl https://goerli.rpc.zklink.io
Estimated deployment cost: 0.00001036124 ETH
Balance of Wallet: 91659544900000000

"NovaNFT" was successfully deployed:
 - Contract address: 0x047190965337D85c304E72DaEEFFE48aCC1FD47c
 - Contract source: contracts/nft/NovaNFT.sol:NovaNFT
 - Encoded constructor arguments: 0x0000000000000000000000008f9fac43a6740eba56b89d146841c5ed2d3665dd

Requesting contract verification...
Your verification ID is: 101
Contract successfully verified on zkSync block explorer!
```

2. Paste the Smart Contract Address (`0x047190965337D85c304E72DaEEFFE48aCC1FD47c`) into `NOVA_NFT_CONTRACT_ADDRESS` in the `.env` file.

#### Deploy Trademark NFT

1. Execute `npm run deploy:trademark`.
2. Paste the Smart Contract Address into `TRADEMARK_CONTRACT_ADDRESS` in the `.env` file.

#### Deploy Nova Lynk NFT

1. Execute `npm run deploy:full_nova_nft`
2. Paste the Smart Contract Address into `FULL_NOVA_NFT_CONTRACT_ADDRESS` in the `.env` file.

#### Deploy Mystery Box NFT

1. Execute `npm run deploy:box`.
2. Paste the Smart Contract Address into `BOX_CONTRACT_ADDRESS` in the `.env` file.

#### Deploy Booster NFT

1. Execute `npm run deploy:booster`
2. Paste the Smart Contract Address into `BOOSTER_CONTRACT_ADDRESS` in the `.env` file.

## Interaction Scripts

Use the following scripts for interactions:

### SBT

1. Run `npm run interact` to receive one Nova SBT NFT to your wallet.
2. Execute `npm run interact:trademark` to mint 4 trademarks to your wallet.
3. Run `npm run interact:full` to burn SBT and 4 trademarks to obtain the Full Version NFT.

### Booster

1. Execute `npm run interact:box` to mint 12 mystery boxes to your wallet.
2. Run `npm run interact:booster` to burn Box to obtain the Booster NFT.

## Testing

1. Get the Goerli Testnet ETH
2. Run `npx hardhat test` to deploy the script and run all test cases

## deploy PhaseII nft 
1. .env add  PHASEII_WITNESS_ADDRESS
2. `npm run compile`
4. `npm run deploy:mysteryBoxII`
5. `npm run deploy:boosterII`
6. .env add PHASEII_BOOSTER_CONTRACT_ADDRESS
7. `npm run compile`
8. `npm run setURLPhaseII:ERC1155`

## deploy meme nft
1. .env add MEME_WITNESS_ADDRESS
2. `npm run compile` 
3. `npm run deploy:InfinityStones` 
4. .env add INFINITY_STONES_ADDRESS
5. `npm run deploy:Chad` 
6. .env add CHAD_ADDRESS
7. set InfinityStones picture url:  `npm run setInfinityStonesURI` 
8. set levels: `npm run setLevels` 
9. set burn count: `npm run setBurnCount` 


## deploy GenesisPassPhaseIII nft
1. .env add GENESISPASS_PHASEIII_WITNESS_ADDRESS、GENESISPASS_PHASEIII_MINTPRICE、PHASEIII_MINT_LIMIT、GENESISPASS_PHASEIII_HARDTOP_LIMIT and set values
2. `npm run compile` 
3. `npm run deploy:GenesisPassPhaseIII`


