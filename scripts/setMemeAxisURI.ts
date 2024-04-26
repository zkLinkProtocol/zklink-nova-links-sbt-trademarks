import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

const tokenInfos = {
  NovaMemeAxisNFT: {
    contractAddress: process.env.MEME_AXIS_CONTRACT_ADDRESS,
    tokenIds: [1, 2, 3, 4, 5, 6, 7],
    tokenURIs: [
      'ipfs://QmdV3wGziGW1n9bNuANr5xLd3LxWWfuGBGH9sgUsj9ffHf/MemeAxis%20%231.json',
      'ipfs://QmdV3wGziGW1n9bNuANr5xLd3LxWWfuGBGH9sgUsj9ffHf/MemeAxis%20%232.json',
      'ipfs://QmdV3wGziGW1n9bNuANr5xLd3LxWWfuGBGH9sgUsj9ffHf/MemeAxis%20%233.json',
      'ipfs://QmdV3wGziGW1n9bNuANr5xLd3LxWWfuGBGH9sgUsj9ffHf/MemeAxis%20%234.json',
      'ipfs://QmdV3wGziGW1n9bNuANr5xLd3LxWWfuGBGH9sgUsj9ffHf/MemeAxis%20%235.json',
      'ipfs://QmdV3wGziGW1n9bNuANr5xLd3LxWWfuGBGH9sgUsj9ffHf/MemeAxis%20%236.json',
      'ipfs://QmdV3wGziGW1n9bNuANr5xLd3LxWWfuGBGH9sgUsj9ffHf/MemeAxis%20%237.json',
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
