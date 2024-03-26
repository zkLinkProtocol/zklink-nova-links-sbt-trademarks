import { expect, assert } from 'chai';
const { ethers } = require('hardhat');
import { Contract, Wallet } from 'ethers';
import { upgrades } from 'hardhat';

describe('NovaLynksNFT', function () {
  let NovaLynksNFT;
  let NovaMysteryBoxNFT;
  let NovaTrademarkNFT;
  let Lynk: Contract;
  let Mystery: Contract;
  let TradeMark: Contract;
  let lynkAddr;
  let mysteryAddr;
  let tradeAddr;

  let owner = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', ethers.provider);
  let addr1: Wallet;
  let addr2: Wallet;
  let signature;

  before(async function () {
    NovaLynksNFT = await ethers.getContractFactory('NovaLynksNFT');
    NovaMysteryBoxNFT = await ethers.getContractFactory('NovaMysteryBoxNFT');
    NovaTrademarkNFT = await ethers.getContractFactory('NovaTrademarkNFT');
    [owner, addr1, addr2] = await ethers.getSigners();
    console.log('owner:', owner.address);
    console.log('addr1:', addr1.address);
    console.log('addr2:', addr2.address);

    Mystery = await upgrades.deployProxy(NovaMysteryBoxNFT, ['NMB', 'NMB', '', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });

    mysteryAddr = await Mystery.getAddress();

    // deploy TradeMark
    TradeMark = await upgrades.deployProxy(NovaTrademarkNFT, ['TradeMark', '', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });
    tradeAddr = await TradeMark.getAddress();

    // deploy Lynk
    Lynk = await upgrades.deployProxy(NovaLynksNFT, ['Lynk', 'Lynk', '', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      constructorArgs: [await Mystery.getAddress(), await TradeMark.getAddress()],
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    });
    lynkAddr = await Lynk.getAddress();
  });

  it('mint TradeMark error', async function () {
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
    let message2 = {
      to: addr1.address,
      nonce: 1,
      tokenId: 2,
      amount: 1,
      expiry: 1742630631000,
    };
    let message3 = {
      to: addr1.address,
      nonce: 1,
      tokenId: 3,
      amount: 1,
      expiry: 1742630631000,
    };
    let message4 = {
      to: addr1.address,
      nonce: 1,
      tokenId: 4,
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
    signature = await owner.signTypedData(domain, types, message2);
    await TradeMark['safeMint(address,uint256,uint256,uint256,uint256,bytes)'](
      addr1.address,
      1,
      2,
      1,
      1742630631000,
      signature,
    );
    signature = await owner.signTypedData(domain, types, message3);
    await TradeMark['safeMint(address,uint256,uint256,uint256,uint256,bytes)'](
      addr1.address,
      1,
      3,
      1,
      1742630631000,
      signature,
    );
    signature = await owner.signTypedData(domain, types, message4);
    await TradeMark['safeMint(address,uint256,uint256,uint256,uint256,bytes)'](
      addr1.address,
      1,
      4,
      1,
      1742630631000,
      signature,
    );

    let token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    let token2Bal = await TradeMark.balanceOf(addr1.address, 2);
    let token3Bal = await TradeMark.balanceOf(addr1.address, 3);
    let token4Bal = await TradeMark.balanceOf(addr1.address, 4);
    expect(token1Bal).to.equal(1);
    expect(token2Bal).to.equal(1);
    expect(token3Bal).to.equal(1);
    expect(token4Bal).to.equal(1);
  });

  it('mint Lynk without SBT error', async function () {
    lynkAddr = await Lynk.getAddress();

    //  set tokenIds
    let tokenids: number[] = [1, 2, 3, 4];
    await Lynk.setTrademarkTokenIds(tokenids);

    // token approve to LynkContract
    const addr1TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr1);
    addr1TradeMark.setApprovalForAll(Lynk.getAddress(), true);

    // mint Lynk
    const addr1Lynk = new ethers.Contract(await Lynk.getAddress(), Lynk.interface, addr1);
    await expect(addr1Lynk['safeMint(address)'](addr1)).to.be.revertedWith('Only nova SBT holders can mint');
  });

  it('mint Mystery', async function () {
    mysteryAddr = await Mystery.getAddress();
    const domain = {
      name: 'NMB',
      version: '0',
      chainId: 31337,
      verifyingContract: mysteryAddr,
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
    await Mystery['safeMint(address,uint256,uint256,bytes)'](addr1.address, 1, 1742630631000, signature);
    expect(await Mystery.balanceOf(addr1.address)).to.equal(1);
  });

  it('mintbatch TradeMark', async function () {
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
    expect(token1Bal).to.equal(3);
  });

  it('mint Lynk error', async function () {
    lynkAddr = await Lynk.getAddress();

    //  set tokenIds
    let tokenids: number[] = [1, 2, 3, 4];
    await Lynk.setTrademarkTokenIds(tokenids);

    // token approve to Lynk contract
    const addr1TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr1);
    addr1TradeMark.setApprovalForAll(Lynk.getAddress(), true);

    // mint Lynk
    const addr1Lynk = new ethers.Contract(await Lynk.getAddress(), Lynk.interface, addr1);
    await addr1Lynk['safeMint(address)'](addr1);

    const balance = await Lynk.balanceOf(addr1.address);
    expect(balance).to.equal(1);

    let token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    let token2Bal = await TradeMark.balanceOf(addr1.address, 2);
    let token3Bal = await TradeMark.balanceOf(addr1.address, 3);
    let token4Bal = await TradeMark.balanceOf(addr1.address, 4);
    expect(token1Bal).to.equal(2);
    expect(token2Bal).to.equal(2);
    expect(token3Bal).to.equal(2);
    expect(token4Bal).to.equal(2);
  });

  it('mint Lynk with Auth error', async function () {
    lynkAddr = await Lynk.getAddress();
    const domain = {
      name: 'Lynk',
      version: '0',
      chainId: 31337,
      verifyingContract: lynkAddr,
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
    await Lynk['safeMintWithAuth(address,uint256,uint256,bytes)'](addr1.address, 1, 1742630631000, signature);
    const balance = await Lynk.balanceOf(addr1.address);
    console.log('Lynk balance Auth:', balance); // mint success
    expect(balance).to.equal(2);
  });

  it('1155 transfer success', async function () {
    const addr1TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr1);
    await addr1TradeMark.safeTransferFrom(addr1.address, addr2.address, 1, 1, '0x');
    let addr2token1Bal = await TradeMark.balanceOf(addr2.address, 1);
    let addr1token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    console.log('addr2token1Bal:', addr2token1Bal);
    console.log('addr1token1Bal:', addr1token1Bal);
    expect(addr2token1Bal).to.equal(1);
    expect(addr1token1Bal).to.equal(1);
  });

  it('1155 burn success', async function () {
    const addr1TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr1);
    const addr2TradeMark = new ethers.Contract(await TradeMark.getAddress(), TradeMark.interface, addr2);
    addr1TradeMark.setApprovalForAll(addr2.address, true);
    await expect(addr2TradeMark.burn(addr1.address, 1, 2)).to.be.revertedWith('ERC1155: burn amount exceeds balance');
    await addr2TradeMark.burn(addr1.address, 1, 1);
    let token1Bal = await TradeMark.balanceOf(addr1.address, 1);
    expect(token1Bal).to.equal(0);
  });
});
