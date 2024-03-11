# zkLink Nova SBT NFT 2024

This project allows you to deploy Non-Fungible Tokens (NFTs) using zkSync with Hardhat.

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone this repository to your local machine:

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

## Usage

To deploy the NFT using zkSync, run the following command:

```bash
npm run deploy
```

This command will trigger the deployment script located at `nft/deploy.ts`. It will deploy your NFT contract using zkSync.

## Customization

If you need to customize the deployment script or any other configurations, feel free to modify the files under the `nft` directory according to your requirements. The main NFT contract is located at `contracts/nft/NovaNFT.sol`.