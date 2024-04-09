import { expect } from 'chai';
const { ethers } = require('hardhat');
import { Contract, Wallet } from 'ethers';
import { upgrades } from 'hardhat';

describe('NovaTrademark', function () {
  let NovaTrademarkNFT;
  let TradeMark: Contract;
  let tradeAddr;
  let owner: Wallet;
  let addr1: Wallet;
  let addr2: Wallet;
  let signature;

  before(async function () {
    NovaTrademarkNFT = await ethers.getContractFactory('NovaTrademarkNFT');
    [owner, addr1, addr2] = await ethers.getSigners();
    console.log('owner:', owner.address);
    console.log('addr1:', addr1.address);
    console.log('addr2:', addr2.address);

    // deploy TradeMark
    TradeMark = await upgrades.deployProxy(NovaTrademarkNFT, ['TradeMark', '', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });
    tradeAddr = await TradeMark.getAddress();
  });

  it('mint TradeMark with sign success', async function () {
    tradeAddr = await TradeMark.getAddress();
    const domain = {
      name: 'TradeMark',
      version: '0',
      chainId: 31337,
      verifyingContract: tradeAddr,
    };

    let types = {
      MintAuth: [
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    let message1 = {
      to: addr1.address,
      nonce: 1,
      tokenId: 1,
      amount: 1,
      expiry: 1742630631000,
    };

    // mint TradeMark
    signature = await owner.signTypedData(domain, types, message1);
    await TradeMark['safeMint(address,uint256,uint256,uint256,uint256,bytes)'](
      addr1.address,
      1,
      1,
      1,
      1742630631000,
      signature,
    );

    let token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    expect(token1Bal).to.equal(1);
  });

  it('mintbatch TradeMark success', async function () {
    tradeAddr = await TradeMark.getAddress();

    let tokenIdList: number[] = [1, 2, 3, 4];
    let amountList: number[] = [2, 2, 2, 2];
    const domain = {
      name: 'TradeMark',
      version: '0',
      chainId: 31337,
      verifyingContract: tradeAddr,
    };
    let batchTypes = {
      BatchMintAuth: [
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'tokenIds', type: 'uint256[]' },
        { name: 'amounts', type: 'uint256[]' },
        { name: 'expiry', type: 'uint256' },
      ],
    };
    let batchMessage = {
      to: addr1.address,
      nonce: 1,
      tokenIds: tokenIdList,
      amounts: amountList,
      expiry: 1742630631000,
    };

    signature = await owner.signTypedData(domain, batchTypes, batchMessage);
    await TradeMark['safeBatchMint(address,uint256,uint256[],uint256[],uint256,bytes)'](
      addr1.address,
      1,
      tokenIdList,
      amountList,
      1742630631000,
      signature,
    );
    let token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    let token2Bal = await TradeMark.balanceOf(addr1.address, 2);
    expect(token1Bal).to.equal(3);
    expect(token2Bal).to.equal(2);
  });

  it('1155 transfer success', async function () {
    const addr1TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr1);
    await addr1TradeMark.safeTransferFrom(addr1.address, addr2.address, 1, 1, '0x');
    let addr2token1Bal = await TradeMark.balanceOf(addr2.address, 1);
    let addr1token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    console.log('addr2token1Bal:', addr2token1Bal);
    console.log('addr1token1Bal:', addr1token1Bal);
    expect(addr2token1Bal).to.equal(1);
    expect(addr1token1Bal).to.equal(2);
  });

  it('1155 burn success', async function () {
    const addr1TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr1);
    const addr2TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr2);
    addr1TradeMark.setApprovalForAll(addr2.address, true);
    await expect(addr2TradeMark.burn(addr1.address, 1, 3)).to.be.revertedWith('ERC1155: burn amount exceeds balance');
    await addr2TradeMark.burn(addr1.address, 1, 1);
    let token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    expect(token1Bal).to.equal(1);
  });

  it('without safeMintCommon success', async function () {
    tradeAddr = await TradeMark.getAddress();
    const domain = {
      name: 'TradeMark',
      version: '0',
      chainId: 31337,
      verifyingContract: tradeAddr,
    };

    let types = {
      MintAuth: [
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    let message1 = {
      to: addr1.address,
      nonce: 2,
      tokenId: 1,
      amount: 4,
      expiry: 1742630631000,
    };

    signature = await owner.signTypedData(domain, types, message1);
    await TradeMark['safeMint2(address,uint256,uint256,uint256,uint256,bytes)'](
      addr1.address,
      2,
      1,
      4,
      1742630631000,
      signature,
    );

    expect(await TradeMark.balanceOf(addr1.address, 1)).to.equal(5);
    expect(await TradeMark.mintNoncesMap(3, addr1.address)).to.equal(0);
    expect(await TradeMark.getMintNonceOne(addr1.address)).to.equal(1);
  });

  it('safeMintCommon success', async function () {
    tradeAddr = await TradeMark.getAddress();
    const domain = {
      name: 'TradeMark',
      version: '0',
      chainId: 31337,
      verifyingContract: tradeAddr,
    };

    let types = {
      MintCommonAuth: [
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'mintType', type: 'uint256' },
      ],
    };

    let types2 = {
      MintAuth: [
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    let message1 = {
      to: addr1.address,
      nonce: 2,
      tokenId: 1,
      amount: 2,
      expiry: 1742630631000,
      mintType: 3,
    };

    // mint TradeMark
    signature = await owner.signTypedData(domain, types, message1);

    await TradeMark['safeMintCommon(address,uint256,uint256,uint256,uint256,bytes,uint256)'](
      addr1.address,
      2,
      1,
      2,
      1742630631000,
      signature,
      3,
    );

    message1 = {
      to: addr1.address,
      nonce: 3,
      tokenId: 1,
      amount: 3,
      expiry: 1742630631000,
      mintType: 3,
    };

    signature = await owner.signTypedData(domain, types, message1);
    // mint nft by safeMintCommon
    await TradeMark['safeMintCommon(address,uint256,uint256,uint256,uint256,bytes,uint256)'](
      addr1.address,
      3,
      1,
      3,
      1742630631000,
      signature,
      3,
    );

    let message2 = {
      to: addr1.address,
      nonce: 4,
      tokenId: 1,
      amount: 4,
      expiry: 1742630631000,
    };

    signature = await owner.signTypedData(domain, types2, message2);
    await TradeMark['safeMint2(address,uint256,uint256,uint256,uint256,bytes)'](
      addr1.address,
      4,
      1,
      4,
      1742630631000,
      signature,
    );

    expect(await TradeMark.balanceOf(addr1.address, 1), 'mint mistake').to.equal(14);
    expect(await TradeMark.mintNoncesMap(3, addr1.address), 'mintNoncesMap mistake').to.equal(2);
    expect(await TradeMark.getMintNonceOne(addr1.address), 'getMintNonceOne mistake').to.equal(1);
  });
});
