import { expect } from 'chai';
import { Contract, Wallet, Signer } from 'ethers';
import { upgrades, ethers } from 'hardhat';

describe('NovaChadNFT', function () {
  let NovaChadNFT;
  let NovaInfinityStonesNFT;
  let NovaChad: Contract;
  let NovaInfinityStones: Contract;
  let ChadAddr;
  let InfinityStonesAddr;
  let owner: Wallet;
  let alice: Wallet;
  let tom: Wallet;
  let signature;
  let aliceInfinityStones: Contract;
  let aliceChad: Contract;
  let ownerChad: Contract;

  let types = {
    MintAuth: [
      { name: 'to', type: 'address' },
      { name: 'nonce', type: 'uint256' },
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

  let CompositeType = {
    CompositeAuth: [
      { name: 'to', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'tokenIds', type: 'uint256[]' },
      { name: 'amounts', type: 'uint256[]' },
      { name: 'expiry', type: 'uint256' },
      { name: 'mintType', type: 'uint256' },
    ],
  };

  before(async function () {
    NovaChadNFT = await ethers.getContractFactory('NovaChadNFT');
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
    NovaChad = await upgrades.deployProxy(NovaChadNFT, ['Chad NFT', 'Chad', '', owner.address, 2], {
      kind: 'uups',
      initializer: 'initialize',
      constructorArgs: [InfinityStonesAddr],
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    });
    ChadAddr = await NovaChad.getAddress();
    console.log('NovaChad deployed to:', ChadAddr);
    console.log('owner addr', owner.address);

    NovaChad.setLevels(3);
    NovaChad.setLevels(5);
    NovaChad.setLevels(8);
    NovaChad.setBurnCount(3, 2);
    NovaChad.setBurnCount(5, 3);

    aliceChad = new ethers.Contract(await NovaChad.getAddress(), NovaChad.interface, alice);
    ownerChad = new ethers.Contract(await NovaChad.getAddress(), NovaChad.interface, owner);
  });

  it('mint with sign', async function () {
    ChadAddr = await NovaChad.getAddress();
    let domain = {
      name: 'Chad NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: ChadAddr,
    };

    let signMessage = {
      to: alice.address,
      nonce: 1,
      expiry: 2675420294000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, types, signMessage);
    await NovaChad['safeMintWithAuth(address,uint256,uint256,uint256,bytes)'](
      alice.address,
      1,
      2675420294000,
      1,
      signature,
    );
    expect(await NovaChad.balanceOf(alice.address)).to.equal(1);
    expect(await NovaChad.mintNoncesMap(1, alice.address)).to.equal(1);
    console.log('tokenid:', await NovaChad._tokenIdTracker());
    expect(await NovaChad._tokenIdTracker()).to.equal(1);
  });

  it('mint with burn InfinityStones', async function () {
    InfinityStonesAddr = await NovaInfinityStones.getAddress();
    ChadAddr = await NovaChad.getAddress();

    // mint axis
    let tokenIdList: number[] = [1, 2];
    let amountList: number[] = [2, 2];
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
    expect(await NovaInfinityStones.balanceOf(alice.address, 1)).to.equal(2);

    aliceInfinityStones = new ethers.Contract(
      await NovaInfinityStones.getAddress(),
      NovaInfinityStones.interface,
      alice,
    );
    await aliceInfinityStones.setApprovalForAll(NovaChad.getAddress(), true);

    // mint cross by burn
    let burnIdList: number[] = [1, 2];
    let burnAmountList: number[] = [1, 1];
    const crossDomain = {
      name: 'Chad NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: ChadAddr,
    };
    let compositeMessage = {
      to: alice.address,
      nonce: 1,
      tokenIds: burnIdList,
      amounts: burnAmountList,
      expiry: 1742630631000,
      mintType: 1,
    };
    signature = await owner.signTypedData(crossDomain, CompositeType, compositeMessage);

    expect(
      await NovaChad.isCompositeAuthorized(alice.address, 1, burnIdList, burnAmountList, 1742630631000, 1, signature),
    ).equals(true);
    await aliceChad.compositeWithAuth(alice.address, 1, burnIdList, burnAmountList, 1742630631000, 1, signature);
    expect(await NovaInfinityStones.balanceOf(alice.address, 1)).to.equal(1);
    expect(await NovaInfinityStones.balanceOf(alice.address, 2)).to.equal(1);
    expect(await NovaChad.balanceOf(alice.address)).to.equal(2);
  });


  it("test 'Exceeds max supply' success", async function () {
    ChadAddr = await NovaChad.getAddress();

    let domain = {
      name: 'Chad NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: ChadAddr,
    };

    let signMessage = {
      to: alice.address,
      nonce: 2,
      expiry: 2675420294000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, types, signMessage);
    await expect(
      NovaChad['safeMintWithAuth(address,uint256,uint256,uint256,bytes)'](
        alice.address,
        2,
        2675420294000,
        1,
        signature,
      ),
    ).to.be.revertedWith('Exceeds max supply');
  });

  it("test 'Invalid tokenIds'", async function () {
    await NovaChad.setMaxSupply(3);
    InfinityStonesAddr = await NovaInfinityStones.getAddress();
    ChadAddr = await NovaChad.getAddress();

    aliceInfinityStones = new ethers.Contract(
      await NovaInfinityStones.getAddress(),
      NovaInfinityStones.interface,
      alice,
    );
    await aliceInfinityStones.setApprovalForAll(NovaChad.getAddress(), true);

    // mint cross by burn
    let burnIdList: number[] = [1];
    let burnAmountList: number[] = [1];
    const crossDomain = {
      name: 'Chad NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: ChadAddr,
    };
    let compositeMessage = {
      to: alice.address,
      nonce: 2,
      tokenIds: burnIdList,
      amounts: burnAmountList,
      expiry: 1742630631000,
      mintType: 1,
    };
    signature = await owner.signTypedData(crossDomain, CompositeType, compositeMessage);

    expect(
      await NovaChad.isCompositeAuthorized(alice.address, 2, burnIdList, burnAmountList, 1742630631000, 1, signature),
    ).equals(true);
    await expect(
      aliceChad.compositeWithAuth(alice.address, 2, burnIdList, burnAmountList, 1742630631000, 1, signature),
    ).to.be.revertedWith('Invalid tokenIds');
  });

  it('test transfer success', async function () {
    await expect(aliceChad.safeTransferFrom(alice.address, tom.address, 0)).to.be.revertedWith('unable transfer');
  });
});
