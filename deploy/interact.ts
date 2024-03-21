import * as hre from 'hardhat';
import { getWallet } from './utils';
import { ethers } from 'ethers';
import { getSignature } from './witness';

export default async function () {
  const CONTRACT_ADDRESS = process.env.NOVA_NFT_CONTRACT_ADDRESS as string;
  if (!CONTRACT_ADDRESS) throw '⛔️ Provide address of the contract to interact with!';

  const accountAddress = process.env.ACCOUNT_ADDRESS as string;
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  if (!process.env.WITNESS_SINGER_PRIVATE_KEY) {
    throw '⛔️ Provide WITNESS_SINGER_PRIVATE_KEY';
  }
  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact('NovaNFT');

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet(), // Interact with the contract on behalf of this wallet
  );

  // Run contract read function
  const response = await contract.balanceOf(accountAddress);
  console.log(`Current Balance is: ${response}`);

  const character = ['ISTP', 'ESFJ', 'INFJ', 'ENTP'][(Math.random() * 4) | 0];

  console.log(`Minting: ${character}`);

  const nonce = 1;
  const expiry = 1711155895;

  // Run contract write function
  const transaction = await contract['safeMint(address,string,bytes,string,uint256)'](
    accountAddress,
    character,
    getSignature(accountAddress, `NOVA-SBT-1-${nonce}`, process.env.WITNESS_SINGER_PRIVATE_KEY || ''),
    String(nonce),
    expiry,
  );
  console.log(`Transaction hash of setting new message: ${transaction.hash}`);

  // Wait until transaction is processed
  await transaction.wait();

  // Read message after transaction
  console.log(`The balance now is: ${await contract.balanceOf(accountAddress)}`);

  return {
    character,
  };
}
