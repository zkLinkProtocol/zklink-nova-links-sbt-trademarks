import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

const tokenInfos = {
  NovaTrademarkNFT: {
    contractAddress: process.env.BOOSTER_CONTRACT_ADDRESS,
    tokenIds: [1, 2, 3, 4],
    tokenURIs: [
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/OakTreeRoots.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/MagnifyingGlass.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/ChessKnight.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/BinaryCodeMatrixCube.json',
    ],
  },
  NovaBoosterkNFT: {
    contractAddress: process.env.TRADEMARK_CONTRACT_ADDRESS,
    tokenIds: [3, 4, 100, 300, 500, 1000, 2000],
    tokenURIs: [
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-x3.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-x4.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-100.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-300.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-500.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-1000.json',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-2000.json',
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
