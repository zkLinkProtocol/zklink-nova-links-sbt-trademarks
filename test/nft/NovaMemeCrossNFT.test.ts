import { expect } from 'chai';
import { Contract, Wallet, Signer } from 'ethers';
import { upgrades, ethers } from 'hardhat';

describe('NovaMemeCrossNFT', function () {
  let NovaMemeCrossNFT;
  let NovaMemeAxisNFT;
  let NovaMemeCross: Contract;
  let NovaMemeAxis: Contract;
  let MemeCrossAddr;
  let MemeAxisAddr;
  let owner: Wallet;
  let alice: Wallet;
  let tom: Wallet;
  let signature;
  let aliceMemeAxis: Contract;
  let aliceMemeCross: Contract;
  let ownerMemeCross: Contract;

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
    NovaMemeCrossNFT = await ethers.getContractFactory('NovaMemeCrossNFT');
    NovaMemeAxisNFT = await ethers.getContractFactory('NovaMemeAxisNFT');
    const signers: Signer[] = await ethers.getSigners();
    [owner, alice, tom] = signers as Wallet[];
    NovaMemeAxis = await upgrades.deployProxy(NovaMemeAxisNFT, ['MemeAxis NFT', 'MemeAxis', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });
    MemeAxisAddr = await NovaMemeAxis.getAddress();
    NovaMemeCross = await upgrades.deployProxy(NovaMemeCrossNFT, ['MemeCross NFT', 'MemeCross', '', owner.address, 2], {
      kind: 'uups',
      initializer: 'initialize',
      constructorArgs: [MemeAxisAddr],
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    });
    MemeCrossAddr = await NovaMemeCross.getAddress();
    console.log('NovaMemeCross deployed to:', MemeCrossAddr);
    console.log('owner addr', owner.address);

    aliceMemeCross = new ethers.Contract(await NovaMemeCross.getAddress(), NovaMemeCross.interface, alice);
    ownerMemeCross = new ethers.Contract(await NovaMemeCross.getAddress(), NovaMemeCross.interface, owner);
  });

  it('mint with sign', async function () {
    MemeCrossAddr = await NovaMemeCross.getAddress();
    let domain = {
      name: 'MemeCross NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: MemeCrossAddr,
    };

    let signMessage = {
      to: alice.address,
      nonce: 1,
      expiry: 2675420294000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, types, signMessage);
    await NovaMemeCross['safeMintWithAuth(address,uint256,uint256,uint256,bytes)'](
      alice.address,
      1,
      2675420294000,
      1,
      signature,
    );
    expect(await NovaMemeCross.balanceOf(alice.address)).to.equal(1);
    expect(await NovaMemeCross.mintNoncesMap(1, alice.address)).to.equal(1);
  });

  it('mint with burn MemeAxis', async function () {
    MemeAxisAddr = await NovaMemeAxis.getAddress();
    MemeCrossAddr = await NovaMemeCross.getAddress();

    // mint axis
    let tokenIdList: number[] = [1, 2];
    let amountList: number[] = [2, 2];
    const domain = {
      name: 'MemeAxis NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: MemeAxisAddr,
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
    await NovaMemeAxis['safeBatchMint(address,uint256,uint256[],uint256[],uint256,uint256,bytes)'](
      alice.address,
      1,
      tokenIdList,
      amountList,
      1742630631000,
      1,
      signature,
    );
    expect(await NovaMemeAxis.balanceOf(alice.address, 1)).to.equal(2);

    aliceMemeAxis = new ethers.Contract(await NovaMemeAxis.getAddress(), NovaMemeAxis.interface, alice);
    await aliceMemeAxis.setApprovalForAll(NovaMemeCross.getAddress(), true);

    // mint cross by burn
    let burnIdList: number[] = [1, 2];
    let burnAmountList: number[] = [1, 1];
    const crossDomain = {
      name: 'MemeCross NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: MemeCrossAddr,
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
      await NovaMemeCross.isCompositeAuthorized(
        alice.address,
        1,
        burnIdList,
        burnAmountList,
        1742630631000,
        1,
        signature,
      ),
    ).equals(true);
    await aliceMemeCross.compositeWithAuth(alice.address, 1, burnIdList, burnAmountList, 1742630631000, 1, signature);
    expect(await NovaMemeAxis.balanceOf(alice.address, 1)).to.equal(1);
    expect(await NovaMemeAxis.balanceOf(alice.address, 2)).to.equal(1);
    expect(await NovaMemeCross.balanceOf(alice.address)).to.equal(2);
  });

  it("test 'Exceeds max supply' success", async function () {
    MemeCrossAddr = await NovaMemeCross.getAddress();

    let domain = {
      name: 'MemeCross NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: MemeCrossAddr,
    };

    let signMessage = {
      to: alice.address,
      nonce: 2,
      expiry: 2675420294000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, types, signMessage);
    await expect(
      NovaMemeCross['safeMintWithAuth(address,uint256,uint256,uint256,bytes)'](
        alice.address,
        2,
        2675420294000,
        1,
        signature,
      ),
    ).to.be.revertedWith('Exceeds max supply');
  });

  it('test transfer success', async function () {
    await aliceMemeCross.safeTransferFrom(alice.address, tom.address, 0);
    expect(await NovaMemeCross.ownerOf(0)).to.equal(tom.address);
  });
});
