import { expect, assert } from 'chai';
import { Contract, Wallet } from "zksync-ethers";

import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../../deploy/utils';

import { getSignature } from "../../deploy/witness";

describe("Trademark NFT", function () {
    let nftContract: Contract;
    let ownerWallet: Wallet;
    let recipientWallet: Wallet;
    let otherWallet: Wallet;

    before(async function () {
        ownerWallet = getWallet();
        // ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
        recipientWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
        otherWallet = getWallet(LOCAL_RICH_WALLETS[3].privateKey);

        nftContract = await deployContract(
            "TrademarkNFT",
            [ownerWallet.address],
            { wallet: ownerWallet, silent: true, noVerify: true }
        );
    });

    it("Should mint a new NFT to the recipient", async function () {
        let nonce = 1;
        const expiry = 1711155895;
        const type_of_nft = "0";

        const address = recipientWallet.address;

        const signature = getSignature(
            address,
            `NOVA-TradeMark-${type_of_nft}-${nonce}`,
            ownerWallet.privateKey || ""
        );


        const tx = await nftContract['safeMint(address, string, bytes, string, uint256)'](address, type_of_nft, signature, String(nonce), expiry);
        await tx.wait();

        const balance = await nftContract.totalSupply();
        expect(balance).to.equal(BigInt("1"));

        const balanceOfRecipient = await nftContract.balanceOf(address);
        expect(balanceOfRecipient).to.equal(BigInt("1"));
    });

    it("Should not mint using the same signature", async function () {
        try {
            let nonce = 1;
            const expiry = 1711155895;
            const type_of_nft = "0";

            const address = recipientWallet.address;

            const signature = getSignature(
                address,
                `NOVA-TradeMark-${type_of_nft}-${nonce}`,
                ownerWallet.privateKey || ""
            );


            const tx = await nftContract['safeMint(address, string, bytes, string, uint256)'](address, type_of_nft, signature, String(nonce), expiry);
        } catch (error) {
            expect(error.message).to.include("Used Signature");
        }
    });

    it("Should mint 3 new NFT to the recipient", async function () {
        const expiry = 1711155895;
        const type_of_nft = "0";
        const address = recipientWallet.address;

        for (let nonce = 2; nonce <= 4; nonce++) {
            const signature = getSignature(
                address,
                `NOVA-TradeMark-${type_of_nft}-${nonce}`,
                ownerWallet.privateKey || ""
            );


            const tx = await nftContract['safeMint(address, string, bytes, string, uint256)'](address, type_of_nft, signature, String(nonce), expiry);
            await tx.wait();
        }

        const balance = await nftContract.totalSupply();
        expect(balance).to.equal(BigInt("4"));

        const balanceOfRecipient = await nftContract.balanceOf(recipientWallet.address);
        expect(balanceOfRecipient).to.equal(BigInt("4"));
    });

});