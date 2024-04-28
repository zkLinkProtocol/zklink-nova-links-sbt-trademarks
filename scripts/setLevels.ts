import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

const tokenInfos = {
  NovaChadNFT: {
    contractAddress: process.env.CHAD_ADDRESS,
    levels: [999, 2499, 4999, 7999, 8999, 10000],
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
              name: 'level',
              type: 'uint256',
            },
          ],
          name: 'setLevels',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      wallet,
    );

    for (let i = 0; i < tokenInfo.levels.length; i++) {
      const tx = await contract.setLevels(tokenInfo.levels[i]);
      console.log(`Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log(`set levels ${tokenInfo.levels[i]} `);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
