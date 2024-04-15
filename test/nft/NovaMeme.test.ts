import { expect } from 'chai';
import { Contract, Wallet, Signer } from 'ethers';
import { upgrades, ethers } from 'hardhat';

describe('NovaMeme', function () {
  let NovaMemeNFT;
  let NovaMeme: Contract;
  let memeAddr;
  let owner: Wallet;
  let alice: Wallet;
  let tom: Wallet;
  let signature;

  let types = {
    MintAuth: [
      { name: 'to', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'mintType', type: 'uint256' },
    ],
  };

  let batchTypes = {
    BatchMintAuth: [
      { name: 'to', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'tokenIds', type: 'uint256[]' },
      { name: 'amounts', type: 'uint256[]' },
      { name: 'expiry', type: 'uint256' },
      { name: 'mintType', type: 'uint256' },
    ],
  };

  before(async function () {
    NovaMemeNFT = await ethers.getContractFactory('NovaMemeNFT');
    const signers: Signer[] = await ethers.getSigners();
    [owner, alice, tom] = signers as Wallet[];
    NovaMeme = await upgrades.deployProxy(NovaMemeNFT, ['meme NFT', 'meme', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });
    memeAddr = await NovaMeme.getAddress();
    console.log('NovaMeme deployed to:', memeAddr);
    console.log('owner addr', owner.address);
  });

  it('mint meme with sign success', async function () {
    memeAddr = await NovaMeme.getAddress();
    const domain = {
      name: 'meme NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: memeAddr,
    };

    let signMessage = {
      to: alice.address,
      nonce: 1,
      tokenId: 1,
      amount: 1,
      expiry: 1742630631000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, types, signMessage);
    await NovaMeme['safeMint(address,uint256,uint256,uint256,uint256,uint256,bytes)'](
      alice.address,
      1,
      1,
      1,
      1742630631000,
      1,
      signature,
    );
    expect(await NovaMeme.balanceOf(alice.address, 1)).to.equal(1);
    expect(await NovaMeme.mintNoncesMap(1, alice.address)).to.equal(1);
    expect(await NovaMeme.mintNoncesMap(2, alice.address)).to.equal(0);
  });

  it('batchmint meme with sign success', async function () {
    memeAddr = await NovaMeme.getAddress();

    let tokenIdList: number[] = [1, 2, 3, 4];
    let amountList: number[] = [2, 2, 2, 2];

    const domain = {
      name: 'meme NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: memeAddr,
    };

    let batchMessage = {
      to: alice.address,
      nonce: 1,
      tokenIds: tokenIdList,
      amounts: amountList,
      expiry: 1742630631000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, batchTypes, batchMessage);
    await NovaMeme['safeBatchMint(address,uint256,uint256[],uint256[],uint256,uint256,bytes)'](
      alice.address,
      1,
      tokenIdList,
      amountList,
      1742630631000,
      1,
      signature,
    );
    expect(await NovaMeme.balanceOf(alice.address, 1)).to.equal(3);
    expect(await NovaMeme.balanceOf(alice.address, 2)).to.equal(2);
    expect(await NovaMeme.balanceOf(alice.address, 3)).to.equal(2);
    expect(await NovaMeme.balanceOf(alice.address, 4)).to.equal(2);
    expect(await NovaMeme.mintNoncesMap(1, alice.address)).to.equal(2);
  });

  it('transfer nft success', async function () {
    const aliceMeme = new ethers.Contract(await NovaMeme.getAddress(), NovaMeme.interface, alice);
    await aliceMeme.safeTransferFrom(alice.address, tom.address, 1, 1, '0x');
    expect(await NovaMeme.balanceOf(alice.address, 1)).to.equal(2);
    expect(await NovaMeme.balanceOf(tom.address, 1)).to.equal(1);
  });

  it('burn nft success', async function () {
    const tomMeme = new ethers.Contract(await NovaMeme.getAddress(), NovaMeme.interface, tom);
    await tomMeme.burn(tom.address, 1, 1);
    expect(await NovaMeme.balanceOf(tom.address, 1)).to.equal(0);
  });

  it('approve nft burn success', async function () {
    const aliceMeme = new ethers.Contract(await NovaMeme.getAddress(), NovaMeme.interface, alice);
    const tomMeme = new ethers.Contract(await NovaMeme.getAddress(), NovaMeme.interface, tom);
    await aliceMeme.setApprovalForAll(tom.address, true);
    await tomMeme.burn(alice.address, 1, 1);
    expect(await NovaMeme.balanceOf(alice.address, 1)).to.equal(1);
  });
});
