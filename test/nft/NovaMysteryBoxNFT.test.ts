import { expect, assert } from 'chai';
const { ethers } = require('hardhat');
import { Contract, Wallet } from 'ethers';
import { upgrades } from 'hardhat';

describe('NovaMysteryBoxNFT', function () {
  let NovaMysteryBoxNFT;
  let nft: Contract;

  let owner: Wallet;
  let addr1: Wallet;
  let addr2: Wallet;
  let signature;

  before(async function () {
    NovaMysteryBoxNFT = await ethers.getContractFactory('NovaMysteryBoxNFT');
    [owner, addr1, addr2] = await ethers.getSigners();
    console.log('owner:', owner.address);
    console.log('addr1:', addr1.address);
    console.log('addr2:', addr2.address);

    nft = await upgrades.deployProxy(NovaMysteryBoxNFT, ['NMB', 'NMB', '', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });
  });

  it('should sign and verify EIP-712 signature', async function () {
    let nftAddr = await nft.getAddress();
    console.log('nftAddr:', nftAddr);
    const domain = {
      name: 'NMB',
      version: '0',
      chainId: 31337,
      verifyingContract: nftAddr,
    };
    let types = {
      MintAuth: [
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    let message = {
      to: addr1.address,
      nonce: 1,
      expiry: 1742630631000,
    };
    signature = await owner.signTypedData(domain, types, message);
    await nft['safeMint(address,uint256,uint256,bytes)'](addr1.address, 1, 1742630631000, signature);
    const balance = await nft.balanceOf(addr1.address);
    expect(balance).to.equal(1);
  });

  it('only owner can signature', async function () {
    let nftAddr = await nft.getAddress();
    console.log('nftAddr:', nftAddr);
    const domain = {
      name: 'NMB',
      version: '0',
      chainId: 31337,
      verifyingContract: nftAddr,
    };
    let types = {
      MintAuth: [
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    let message = {
      to: addr1.address,
      nonce: 1,
      expiry: 1742630631000,
    };
    signature = await addr1.signTypedData(domain, types, message);
    expect(nft['safeMint(address,uint256,uint256,bytes)'](addr1.address, 1, 1742630631000, signature)).to.be.reverted;
  });

  /**
   * test transfer
   */
  it('non-NFT owner should not have permission to transfer', async function () {
    const addr1TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr1);
    const addr2TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr2);
    await addr1TokenContract.approve(addr2.address, 0);
    await addr2TokenContract.transferFrom(addr1, addr2, 0);
    assert.equal(await nft.ownerOf(0), addr2.address);
  });

  /**
   * test not ower or approved burn
   */
  it('approve burn error', async function () {
    const addr1TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr1);
    addr1TokenContract.approve(addr2.address, 0);
    const addr2TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr2);
    await addr2TokenContract.burn(0);
    let exist = await addr1TokenContract.exists(0);
    expect(exist).to.equal(false);
  });

  it('non-NFT owner should not have permission to burn', async function () {
    const addr2TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr2);
    await expect(addr2TokenContract.burn(0)).to.be.revertedWith('ERC721: caller is not token owner or approved');
  });

  /**
   * test ower burn
   */
  it('burn fail', async function () {
    const addr1TokenContract = new ethers.Contract(await nft.getAddress(), nft.interface, addr1);
    await addr1TokenContract.burn(0);
    let exist = await addr1TokenContract.exists(0);
    expect(exist).to.equal(false);

    let nonce = await addr1TokenContract.burnNonces(addr1.address);
    expect(nonce).to.equal(1);
  });
});
