import * as hre from 'hardhat';
import { getWallet } from './utils';
import { ethers } from 'ethers';
import { getSignature } from './witness';

// Address of the contract to interact with
const CONTRACT_ADDRESS = process.env.BOX_CONTRACT_ADDRESS as string;
if (!CONTRACT_ADDRESS) throw '⛔️ Provide address of the contract to interact with!';

const accountAddress = process.env.ACCOUNT_ADDRESS as string;

// An example of a script to interact with the contract
export default async function () {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  if (!process.env.WITNESS_SINGER_PRIVATE_KEY) {
    throw '⛔️ Provide WITNESS_SINGER_PRIVATE_KEY';
  }
  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact('MysteryBoxNFT');

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet(), // Interact with the contract on behalf of this wallet
  );

  // Run contract read function
  const response = await contract.balanceOf(accountAddress);
  console.log(`Current Balance for account ${accountAddress} is: ${response}`);

  let nonce = 1;
  const expiry = 1711155895;

  for (let i = 0; i < 12; i++) {
    // Run contract write function
    const transaction = await contract['safeMint(address,bytes,string,uint256)'](
      accountAddress,
      getSignature(accountAddress, `NOVA-MYSTERY-BOX-${nonce}`, process.env.WITNESS_SINGER_PRIVATE_KEY || ''),
      String(nonce),
      expiry,
    );
    console.log(`Transaction hash of setting new message: ${transaction.hash}`);

    // Wait until transaction is processed
    await transaction.wait();

    // Read message after transaction
    console.log(`The balance now is: ${await contract.balanceOf(accountAddress)}`);

    nonce++;
  }
}
