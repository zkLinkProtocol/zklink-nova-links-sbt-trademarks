import { expect, assert } from 'chai';
import { Contract, Wallet } from "zksync-ethers";

import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../../deploy/utils';

import { getSignature } from "../../deploy/witness";

describe("Booster NFT", function () {
    let mysteryBoxNFTContract: Contract;
    let boosterNFTContract: Contract;
    let mysteryBoxNFTContractAddress: string;
    let boosterNFTContractAddress: string;

    let ownerWallet: Wallet;
    let recipientWallet: Wallet;
    // let otherWallet: Wallet;

    before(async function () {
        ownerWallet = getWallet();
        // ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
        recipientWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
        // otherWallet = getWallet(LOCAL_RICH_WALLETS[3].privateKey);

        mysteryBoxNFTContract = await deployContract(
            "MysteryBoxNFT",
            [ownerWallet.address],
            { wallet: ownerWallet, silent: true, noVerify: true }
        );


        mysteryBoxNFTContractAddress = await mysteryBoxNFTContract.getAddress();

        console.log(`Box Address: ${mysteryBoxNFTContractAddress}`);

        boosterNFTContract = await deployContract(
            "BoosterNFT",
            [ownerWallet.address, mysteryBoxNFTContractAddress],
            { wallet: ownerWallet, silent: true, noVerify: true }
        );

        boosterNFTContractAddress = await boosterNFTContract.getAddress();
    });

    it("Should burn the Box and mint new Booster", async function () {
        let nonce = 1;
        const expiry = 1711155895;

        const address = ownerWallet.address;

        const signature = getSignature(
            address,
            `NOVA-MYSTERY-BOX-${nonce}`,
            ownerWallet.privateKey || ""
        );


        const tx = await mysteryBoxNFTContract['safeMint(address, bytes, string, uint256)'](address, signature, String(nonce), expiry);
        await tx.wait();

        const balance = await mysteryBoxNFTContract.totalSupply();
        expect(balance).to.equal(BigInt("1"));

        const balanceOfRecipient = await mysteryBoxNFTContract.balanceOf(address);
        expect(balanceOfRecipient).to.equal(BigInt("1"));

        // End of Box

        // Start of Booster

        console.log("Approve");
        // Approve
        const tx2 = await mysteryBoxNFTContract['approve(address, uint256)'](boosterNFTContractAddress, BigInt("0"));
        await tx2.wait();

        const type_of_booster = "300";

        // NOVA-BOOSTER-300-1
        const signature2 = getSignature(
            address,
            `NOVA-BOOSTER-SBT-${type_of_booster}-${nonce}`,
            ownerWallet.privateKey || ""
        );

        console.log(`Mystery BOX is approved`);

        // Mint Booster
        const tx3 = await boosterNFTContract['safeMint(address, uint256, string, string, uint256, bytes)'](address, BigInt("0"), type_of_booster, String(nonce), expiry, signature2);

        await tx3.wait();

        const balance2 = await mysteryBoxNFTContract.totalSupply();
        expect(balance2).to.equal(BigInt("0"));

        const balance3 = await boosterNFTContract.totalSupply();
        expect(balance3).to.equal(BigInt("1"));

        const balance4 = await boosterNFTContract.balanceOf(address);
        expect(balance4).to.equal(BigInt("1"));
    });
});