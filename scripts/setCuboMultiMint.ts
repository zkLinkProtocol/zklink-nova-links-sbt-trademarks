import { ethers } from 'hardhat';
import dotenv from 'dotenv';
// Load env file
dotenv.config();

if (!process.env.CUBO_ADDRESS) throw '⛔️ CUBO_ADDRESS is not set in .env file';
const CuboMultiMintProxyAddr: string = process.env.CUBO_ADDRESS;

async function main(): Promise<void> {
  const provider = new ethers.JsonRpcProvider(process.env.ZKLINK_RPC);
  if (!process.env.WALLET_PRIVATE_KEY) throw "⛔️ Wallet private key wasn't found in .env file!";
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

  const CuboMultiMint = await ethers.getContractAt('NovaCuboNFT', CuboMultiMintProxyAddr, wallet);
  // set signer address
  if (!process.env.CUBO_WITNESS_ADDRESS) throw '⛔️ CUBO_WITNESS_ADDRESS is not set in .env file';
  const signerToSet: string = process.env.CUBO_WITNESS_ADDRESS;
  const tx1 = await CuboMultiMint.setActiveSigner(signerToSet, true);
  await tx1.wait();
  console.log('signer set tx:', tx1.hash);
}

main()
  .then((): void => process.exit(0))
  .catch((error: Error): void => {
    console.error(error);
    process.exit(1);
  });
