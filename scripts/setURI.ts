import { ethers } from "hardhat";
import dotenv from 'dotenv';
// Load env file
dotenv.config();

// const contractAddress = '0xA594bF8Ec851a7c58a348DF81Bb311cE0BCAD5C4';
const contractAddress = '0x7137B3c6Ec578ED324965393A52b130eC567DE4c';

async function main() {
    const provider = new ethers.JsonRpcProvider('https://goerli.rpc.zklink.io');
    if (!process.env.WALLET_PRIVATE_KEY) throw "⛔️ Wallet private key wasn't found in .env file!";
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

    const contract = new ethers.Contract(
        contractAddress, [{
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "newURI",
                    "type": "string"
                }
            ],
            "name": "setURI",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }], wallet
    );

    // const tokenIds = [1, 2, 3, 4]
    // const tokenURIs = ["ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/OakTreeRoots.json", "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/MagnifyingGlass.json", "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/ChessKnight.json", "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/BinaryCodeMatrixCube.json"]
    const tokenIds = [3, 4, 100, 300, 500, 1000, 2000]
    const tokenURIs = [
        "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-x3.json",
        "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-x4.json",
        "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-100.json",
        "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-300.json",
        "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-500.json",
        "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-1000.json",
        "ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/NovaBooster-2000.json",
    ]

    for (let i = 0; i < tokenIds.length; i++) {
        const tx = await contract.setURI(tokenIds[i], tokenURIs[i]);
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log(`Token URI for token ID ${tokenIds[i]} set to ${tokenURIs[i]}`);
    }

    console.log('Script End');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
