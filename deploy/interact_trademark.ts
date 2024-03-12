import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers } from "ethers";
import { getSignature } from "./witness";

// Address of the contract to interact with
const CONTRACT_ADDRESS = process.env.TRADEMARK_CONTRACT_ADDRESS as string;
if (!CONTRACT_ADDRESS)
    throw "⛔️ Provide address of the contract to interact with!";

const accountAddress = process.env.ACCOUNT_ADDRESS as string;

// An example of a script to interact with the contract
export default async function () {
    console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

    if (!process.env.WITNESS_SINGER_PRIVATE_KEY) {
        throw "⛔️ Provide WITNESS_SINGER_PRIVATE_KEY";
    }
    // Load compiled contract info
    const contractArtifact = await hre.artifacts.readArtifact("TrademarkNFT");

    // Initialize contract instance for interaction
    const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractArtifact.abi,
        getWallet()
    );

    // Run contract read function
    const response = await contract.balanceOf(accountAddress);
    console.log(`Current Balance for account ${accountAddress} is: ${response}`);

    const trademarks = ["0", "1", "2", "3"];

    let nonce = 1;
    const expiry = 1711155895;

    for (let i = 0; i < trademarks.length; i++) {
        // Run contract write function
        const transaction = await contract["safeMint(address,string,bytes,string,uint256)"](
            accountAddress,
            trademarks[i],
            getSignature(
                accountAddress,
                `NOVA-TradeMark-1-${nonce}`,
                process.env.WITNESS_SINGER_PRIVATE_KEY || ""
            ),
            String(nonce),
            expiry
        );
        console.log(`Transaction hash of setting new message: ${transaction.hash}`);

        // Wait until transaction is processed
        await transaction.wait();

        // Read message after transaction
        console.log(
            `The balance now is: ${await contract.balanceOf(accountAddress)}`
        );
        nonce++;
    }
}
