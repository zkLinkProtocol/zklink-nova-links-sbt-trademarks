import { expect, assert } from 'chai';
const { ethers } = require('hardhat');
import { Contract,Wallet } from 'ethers';
import { upgrades } from 'hardhat';
import { keccak256 } from "@ethersproject/keccak256";

describe("NovaMysteryBoxNFT", function () {
    let NovaMysteryBoxNFT;
    let nft:Contract;

    let owner: Wallet;
    let addr1: Wallet;
    let addr2: Wallet;
    let signature;
    // let test = new Wallet('0xbb64ec9d1d3b623d1172f7fb01e99512232a8064c403f97cb0978a1d4f100fb1', ethers.provider);


    before(async function () {
        NovaMysteryBoxNFT = await ethers.getContractFactory("NovaMysteryBoxNFT");
        [owner, addr1, addr2] = await ethers.getSigners();
        console.log("owner:", owner.address);
        console.log("addr1:", addr1.address);
        console.log("addr2:", addr2.address);

        nft = await upgrades.deployProxy(NovaMysteryBoxNFT,["NMB", "NMB", '', owner.address],{
            kind: 'uups',
            initializer: 'initialize',
            unsafeAllow:["constructor"]
        });

    });


    it("should sign and verify EIP-712 signature", async function () {
        // 构建 domain 数据
        let nftAddr = await nft.getAddress();
        console.log("nftAddr:", nftAddr);
        const domain = {
            name: "NMB",
            version: "0",
            chainId: 31337, 
            verifyingContract: nftAddr
        };
        let types = {
            MintAuth: [
                { name: "to", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "expiry", type: "uint256" },
            ]
        };
    
        let message = {
            to: addr1.address,
            nonce: 1,
            expiry: 1742630631000
        };
        signature = await owner.signTypedData(domain,types,message);
        // signature = await addr1.signTypedData(domain,types,message); // 报错addr1没有签名权限
        console.log("signature:", signature);
        await nft['safeMint(address,uint256,uint256,bytes)'](addr1.address, 1, 1742630631000, signature);
        const balance = await nft.balanceOf(addr1.address);
        console.log("balance:", balance);
    });


    /**
     * test transfer
     * not owner error: ERC721: transfer from incorrect owner
     */
    // it("non-NFT owner should not have permission to transfer", async function () {
    //     const addr1TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr1);
    //     const addr2TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr2);
    //     await addr1TokenContract.approve(addr2.address,0);
    //     await addr2TokenContract.transferFrom(addr1,addr2,0);  
    //     assert.equal(await nft.ownerOf(0), addr2.address);
    // });

    /**
     * test not ower or approved burn
     */
    // it("non-NFT owner should not have permission to burn", async function () {
    //     // error message：'ERC721: caller is not token owner or approved'
    //     const addr1TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr1);
    //     addr1TokenContract.approve(addr2.address,0);
    //     const addr2TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr2);
    //     await addr2TokenContract.burn(0);
    // });

    /**
     * test ower burn
     */
    it("burn fail", async function () {
        const addr1TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr1);
        await addr1TokenContract.burn(0);
        let exist = await addr1TokenContract.exists(0);
        console.log("exist:",exist);

        let nonce = await addr1TokenContract.burnNonces(addr1.address);
        console.log("nonce:",nonce);
    });
});
