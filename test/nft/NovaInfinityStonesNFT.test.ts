import { expect } from 'chai';
import { Contract, Wallet, Signer } from 'ethers';
import { upgrades, ethers } from 'hardhat';

describe('NovaInfinityStones', function () {
  let NovaInfinityStonesNFT;
  let NovaInfinityStones: Contract;
  let InfinityStonesAddr;
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
    NovaInfinityStonesNFT = await ethers.getContractFactory('NovaInfinityStonesNFT');
    const signers: Signer[] = await ethers.getSigners();
    [owner, alice, tom] = signers as Wallet[];
    NovaInfinityStones = await upgrades.deployProxy(
      NovaInfinityStonesNFT,
      ['InfinityStones NFT', 'InfinityStones', owner.address],
      {
        kind: 'uups',
        initializer: 'initialize',
        unsafeAllow: ['constructor'],
      },
    );
    InfinityStonesAddr = await NovaInfinityStones.getAddress();
    console.log('NovaInfinityStones deployed to:', InfinityStonesAddr);
    console.log('owner addr', owner.address);
  });

  it('mint InfinityStones with sign success', async function () {
    InfinityStonesAddr = await NovaInfinityStones.getAddress();
    const domain = {
      name: 'InfinityStones NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: InfinityStonesAddr,
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
    await NovaInfinityStones['safeMint(address,uint256,uint256,uint256,uint256,uint256,bytes)'](
      alice.address,
      1,
      1,
      1,
      1742630631000,
      1,
      signature,
    );
    expect(await NovaInfinityStones.balanceOf(alice.address, 1)).to.equal(1);
    expect(await NovaInfinityStones.mintNoncesMap(1, alice.address)).to.equal(1);
    expect(await NovaInfinityStones.mintNoncesMap(2, alice.address)).to.equal(0);
  });

  it("test 'TokenId already minted' success", async function () {
    InfinityStonesAddr = await NovaInfinityStones.getAddress();
    const domain = {
      name: 'InfinityStones NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: InfinityStonesAddr,
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
    await expect(
      NovaInfinityStones['safeMint(address,uint256,uint256,uint256,uint256,uint256,bytes)'](
        alice.address,
        1,
        1,
        1,
        1742630631000,
        1,
        signature,
      ),
    ).to.be.revertedWith('TokenId already minted');
  });

  it('batchmint InfinityStones with sign success', async function () {
    InfinityStonesAddr = await NovaInfinityStones.getAddress();

    let tokenIdList: number[] = [5, 2, 3, 4];
    let amountList: number[] = [2, 2, 2, 2];

    const domain = {
      name: 'InfinityStones NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: InfinityStonesAddr,
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
    await NovaInfinityStones['safeBatchMint(address,uint256,uint256[],uint256[],uint256,uint256,bytes)'](
      alice.address,
      1,
      tokenIdList,
      amountList,
      1742630631000,
      1,
      signature,
    );
    expect(await NovaInfinityStones.balanceOf(alice.address, 5)).to.equal(2);
    expect(await NovaInfinityStones.balanceOf(alice.address, 2)).to.equal(2);
    expect(await NovaInfinityStones.balanceOf(alice.address, 3)).to.equal(2);
    expect(await NovaInfinityStones.balanceOf(alice.address, 4)).to.equal(2);
    expect(await NovaInfinityStones.mintNoncesMap(1, alice.address)).to.equal(2);
  });

  it('transfer nft success', async function () {
    const aliceInfinityStones = new ethers.Contract(
      await NovaInfinityStones.getAddress(),
      NovaInfinityStones.interface,
      alice,
    );
    await aliceInfinityStones.safeTransferFrom(alice.address, tom.address, 1, 1, '0x');
    expect(await NovaInfinityStones.balanceOf(alice.address, 1)).to.equal(0);
    expect(await NovaInfinityStones.balanceOf(tom.address, 1)).to.equal(1);
  });

  it('burn nft success', async function () {
    const tomInfinityStones = new ethers.Contract(
      await NovaInfinityStones.getAddress(),
      NovaInfinityStones.interface,
      tom,
    );
    await tomInfinityStones.burn(tom.address, 1, 1);
    expect(await NovaInfinityStones.balanceOf(tom.address, 1)).to.equal(0);
  });

  it('approve nft burn success', async function () {
    const aliceInfinityStones = new ethers.Contract(
      await NovaInfinityStones.getAddress(),
      NovaInfinityStones.interface,
      alice,
    );
    const tomInfinityStones = new ethers.Contract(
      await NovaInfinityStones.getAddress(),
      NovaInfinityStones.interface,
      tom,
    );
    await aliceInfinityStones.setApprovalForAll(tom.address, true);
    await tomInfinityStones.burn(alice.address, 2, 1);
    expect(await NovaInfinityStones.balanceOf(alice.address, 2)).to.equal(1);
  });
});
