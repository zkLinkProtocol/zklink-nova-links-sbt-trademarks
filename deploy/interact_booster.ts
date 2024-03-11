import * as hre from "hardhat";
import { getWallet } from "./utils";
import { ethers } from "ethers";
import { getSignature } from "./witness";

export default async function () {
  const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS as string;
  // const NOVA_NFT_CONTRACT_ADDRESS = process.env.NOVA_NFT_CONTRACT_ADDRESS as string;
  const BOX_CONTRACT_ADDRESS = process.env.BOX_CONTRACT_ADDRESS as string;
  // const FULL_NOVA_NFT_CONTRACT_ADDRESS = process.env.FULL_NOVA_NFT_CONTRACT_ADDRESS as string;
  const BOOSTER_CONTRACT_ADDRESS = process.env.BOOSTER_CONTRACT_ADDRESS as string;


  // console.log(`Running script to interact with Lynk contract ${FULL_NOVA_NFT_CONTRACT_ADDRESS}`);

  if (!process.env.WITNESS_SINGER_PRIVATE_KEY) {
    throw "⛔️ Provide WITNESS_SINGER_PRIVATE_KEY";
  }

  const wallet = getWallet();

  // Initialize contract instance for interaction

  const mysteryBoxNFTContract = new ethers.Contract(
    BOX_CONTRACT_ADDRESS,
    (await hre.artifacts.readArtifact("MysteryBoxNFT")).abi,
    wallet,
  );

  const boosterContract = new ethers.Contract(
    BOOSTER_CONTRACT_ADDRESS,
    (await hre.artifacts.readArtifact("BoosterNFT")).abi,
    wallet,
  );

  // 1. Approve Box in Frontend by User
  console.log('Approve Box');

  const approve_all_transaction = await mysteryBoxNFTContract['setApprovalForAll(address, bool)'](BOOSTER_CONTRACT_ADDRESS, true);
  await approve_all_transaction.wait();
  console.log(`Transaction hash of setApprovalForAll: ${approve_all_transaction.hash}`);

  console.log("Approve Box Done");

  // NOTE: Change this
  const tokenId = 3;

  // 2. Burn the above NFT and mint the booster (Backend)
  const safe_mint_transaction = await boosterContract['safeMint(uint256, string, bytes)'](
    tokenId,
    '500',
    getSignature(
      ACCOUNT_ADDRESS,
      "NOVA-BOOSTER-SBT-1",
      process.env.WITNESS_SINGER_PRIVATE_KEY || ""
    )
  );

  console.log(`Transaction hash of booster NFT: ${safe_mint_transaction.hash}`);

  await safe_mint_transaction.wait();
}
