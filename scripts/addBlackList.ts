import { ethers } from 'hardhat';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
// Load env file
dotenv.config();

function readFileToArray(filePath: string): string[] {
  // Read file synchronously
  const fileContents = fs.readFileSync(filePath, 'utf-8');

  // Split the file contents by new line and assign to an array
  const linesArray = fileContents.split('\n');

  // Remove any trailing empty lines
  return linesArray.filter(line => line.trim() !== '');
}

const filePath = path.join('./', 'blacklist.txt');

const tokenInfos = {
  NovaLynksNFT: {
    contractAddress: process.env.LYNKS_ADDRESS,
    blackList: readFileToArray(filePath),
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
              internalType: 'address[]',
              name: 'accounts',
              type: 'address[]',
            },
          ],
          name: 'batchAddToBlackList',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      wallet,
    );

    console.log(tokenInfo.blackList);
    const tx = await contract.batchAddToBlackList(tokenInfo.blackList);
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log(`batchAddToBlackList ${tokenInfo.blackList}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
