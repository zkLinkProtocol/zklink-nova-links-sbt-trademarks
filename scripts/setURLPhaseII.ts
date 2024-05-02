import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

const tokenInfos = {
  NovaBoosterkNFT: {
    contractAddress: process.env.PHASEII_BOOSTER_CONTRACT_ADDRESS,
    tokenIds: [50, 100, 200, 500, 1000],
    tokenURIs: [
      'ipfs://QmRuc1E8udyBzihcubiezSEZ4YPbP5z8skauc6KfPfDfUG/50.json',
      'ipfs://QmRuc1E8udyBzihcubiezSEZ4YPbP5z8skauc6KfPfDfUG/100.json',
      'ipfs://QmRuc1E8udyBzihcubiezSEZ4YPbP5z8skauc6KfPfDfUG/200.json',
      'ipfs://QmRuc1E8udyBzihcubiezSEZ4YPbP5z8skauc6KfPfDfUG/500.json',
      'ipfs://QmRuc1E8udyBzihcubiezSEZ4YPbP5z8skauc6KfPfDfUG/1000.json',
    ],
  },
};

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ZKLINK_RPC);
  if (!process.env.WALLET_PRIVATE_KEY) throw "⛔️ Wallet private key wasn't found in .env file!";
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

  for (const tokenInfo of Object.values(tokenInfos)) {
    if (!tokenInfo.contractAddress) throw "⛔️ Contract address wasn't found in .env file!";
    const contract = new ethers.Contract(
      tokenInfo.contractAddress,
      [
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'tokenId',
              type: 'uint256',
            },
            {
              internalType: 'string',
              name: 'newURI',
              type: 'string',
            },
          ],
          name: 'setURI',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      wallet,
    );

    for (let i = 0; i < tokenInfo.tokenIds.length; i++) {
      const tx = await contract.setURI(tokenInfo.tokenIds[i], tokenInfo.tokenURIs[i]);
      console.log(`Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log(`Token URI for token ID ${tokenInfo.tokenIds[i]} set to ${tokenInfo.tokenURIs[i]}`);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
