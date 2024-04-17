import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

const tokenInfos = {
  NovaMemeCrossNFT: {
    contractAddress: process.env.MEME_CROSS_CONTRACT_ADDRESS,
    tokenIds: [1, 2, 3, 4, 5, 6, 7],
    amount: [ 1, 1, 1, 1, 1, 1, 1,],
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
              internalType: "uint256",
              name: "tokenId",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256"
            }
          ],
          name: "setMemeAxisTokenIds",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
      ],
      wallet,
    );

    for (let i = 0; i < tokenInfo.tokenIds.length; i++) {
      const tx = await contract.setMemeTokenIds(tokenInfo.tokenIds[i], tokenInfo.amount[i]);
      console.log(`Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log(`set tokenId:${tokenInfo.tokenIds[i]} burn amount: ${tokenInfo.amount[i]}`);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
