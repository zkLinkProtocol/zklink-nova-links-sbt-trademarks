import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers } from "ethers";
import { getSignature } from "./witness";

export default async function () {
  const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS as string;
  const NOVA_NFT_CONTRACT_ADDRESS = process.env.NOVA_NFT_CONTRACT_ADDRESS as string;
  const TRADEMARK_CONTRACT_ADDRESS = process.env.TRADEMARK_CONTRACT_ADDRESS as string;
  const FULL_NOVA_NFT_CONTRACT_ADDRESS = process.env.FULL_NOVA_NFT_CONTRACT_ADDRESS as string;


  console.log(`Running script to interact with Lynk contract ${FULL_NOVA_NFT_CONTRACT_ADDRESS}`);

  if (!process.env.WITNESS_SINGER_PRIVATE_KEY) {
    throw "⛔️ Provide WITNESS_SINGER_PRIVATE_KEY";
  }

  const wallet = getWallet();

  // Initialize contract instance for interaction
  const novaNFTContract = new ethers.Contract(
    NOVA_NFT_CONTRACT_ADDRESS,
    (await hre.artifacts.readArtifact("NovaNFT")).abi,
    wallet,
  );

  const tradeMarkNFTContract = new ethers.Contract(
    TRADEMARK_CONTRACT_ADDRESS,
    (await hre.artifacts.readArtifact("TrademarkNFT")).abi,
    wallet,
  );

  const fullNovaContract = new ethers.Contract(
    FULL_NOVA_NFT_CONTRACT_ADDRESS,
    (await hre.artifacts.readArtifact("FullNovaNFT")).abi,
    wallet,
  );

  // NOTE: Change this
  const tokenId = 0;

  // 1. Approve NOVA
  console.log(`Trying to approve NOVA NFT with id ${tokenId}`);
  try {
    const ownerOfNFT = await fullNovaContract['ownerOf(uint256)'](tokenId);
    if (ownerOfNFT === ACCOUNT_ADDRESS) {
      console.log('You have already mint the full version of Nova Lynk.');
      return;
    }
    console.log(`Owner of tokenId ${tokenId} is ${ownerOfNFT}`);
  } catch (e) {

  }


  const transaction = await novaNFTContract['approve(address, uint256)'](FULL_NOVA_NFT_CONTRACT_ADDRESS, tokenId);

  await transaction.wait();
  console.log(`Transaction hash of approval: ${transaction.hash}`);

  // 2. Approve Trademarks

  const approve_all_transaction = await tradeMarkNFTContract['setApprovalForAll(address, bool)'](FULL_NOVA_NFT_CONTRACT_ADDRESS, true);
  await approve_all_transaction.wait();
  console.log(`Transaction hash of setApprovalForAll: ${approve_all_transaction.hash}`);

  // 3. Burn the above NFTs and mint a full version NFT
  const nonce = 1;
  const expiry = 1711155895;

  const safe_mint_transaction = await fullNovaContract['safeMint(uint256, string, uint256, uint256, uint256, uint256, bytes, string, uint256)'](
    tokenId,
    'ESFJ',
    1,
    2,
    3,
    4,
    getSignature(
      ACCOUNT_ADDRESS,
      "NOVA-LYNK-1",
      process.env.WITNESS_SINGER_PRIVATE_KEY || ""
    ),
    String(nonce),
    expiry
  );

  console.log(`Transaction hash of safe mint Full Nova NFT: ${safe_mint_transaction.hash}`);

  await safe_mint_transaction.wait();
}
