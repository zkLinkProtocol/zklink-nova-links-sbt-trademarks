import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers } from "ethers";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "0xaC49A34EC11A6B69B6971116069896B661ecf3AC";
if (!CONTRACT_ADDRESS) throw "⛔️ Provide address of the contract to interact with!";

const accountAddress = "0x2B0cbA2DEa9e77141C9101241AFd888d950b962A";


// An example of a script to interact with the contract
export default async function () {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact("NovaNFT");

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet() // Interact with the contract on behalf of this wallet
  );

  // Run contract read function
  const response = await contract.balanceOf(accountAddress);
  console.log(`Current Balance is: ${response}`);

  const characters = ['ISTP', 'ESFJ', 'INFJ', 'ENTP'];
  for (let i = 0; i < characters.length; i++) {
    console.log(`Minting: ${characters[i]}`);

    // Run contract write function
    const transaction = await contract.safeMint(accountAddress, characters[i]);
    console.log(`Transaction hash of setting new message: ${transaction.hash}`);

    // Wait until transaction is processed
    await transaction.wait();

    // Read message after transaction
    console.log(`The balance now is: ${await contract.balanceOf(accountAddress)}`);
  }
}
