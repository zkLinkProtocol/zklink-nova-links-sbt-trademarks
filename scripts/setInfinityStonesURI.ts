import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

const tokenInfos = {
  NovaInfinityStonesNFT: {
    contractAddress: process.env.INFINITY_STONES_ADDRESS,
    tokenIds: [1, 2, 3, 4, 5, 6, 7],
    tokenURIs: [
      'ipfs://QmY1PPZEJVemm9VHVJhYDn16XhArqFjQ3gd5v4zuPyvf6N/Infinity%20Stones%20%231.json',
      'ipfs://QmY1PPZEJVemm9VHVJhYDn16XhArqFjQ3gd5v4zuPyvf6N/Infinity%20Stones%20%232.json',
      'ipfs://QmY1PPZEJVemm9VHVJhYDn16XhArqFjQ3gd5v4zuPyvf6N/Infinity%20Stones%20%233.json',
      'ipfs://QmY1PPZEJVemm9VHVJhYDn16XhArqFjQ3gd5v4zuPyvf6N/Infinity%20Stones%20%234.json',
      'ipfs://QmY1PPZEJVemm9VHVJhYDn16XhArqFjQ3gd5v4zuPyvf6N/Infinity%20Stones%20%235.json',
      'ipfs://QmY1PPZEJVemm9VHVJhYDn16XhArqFjQ3gd5v4zuPyvf6N/Infinity%20Stones%20%236.json',
      'ipfs://QmY1PPZEJVemm9VHVJhYDn16XhArqFjQ3gd5v4zuPyvf6N/Infinity%20Stones%20%237.json',
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
