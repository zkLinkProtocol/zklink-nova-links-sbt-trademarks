import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

const param = {
  LYNKS_ADDRESS: process.env.LYNKS_ADDRESS,
  LYNKS_MAXSUPPLY: process.env.LYNKS_MAXSUPPLY,
};

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ZKLINK_RPC);
  if (!process.env.WALLET_PRIVATE_KEY) throw "⛔️ Wallet private key wasn't found in .env file!";
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  if (!param.LYNKS_ADDRESS) throw "⛔️ Contract address wasn't found in .env file!";
  const tx = await new ethers.Contract(
    param.LYNKS_ADDRESS,
    [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: '_maxSupply',
            type: 'uint256',
          },
        ],
        name: 'setMaxSupply',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    wallet,
  ).setMaxSupply(param.LYNKS_MAXSUPPLY);
  await tx.wait();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
