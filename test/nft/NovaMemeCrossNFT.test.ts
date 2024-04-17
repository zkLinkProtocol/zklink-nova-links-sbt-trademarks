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
    NovaMemeCross = await upgrades.deployProxy(NovaMemeCrossNFT, ['MemeCross NFT', 'MemeCross', '', owner.address, 2, 1], {
      kind: 'uups',
      initializer: 'initialize',
      constructorArgs: [MemeAxisAddr],
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    });
    MemeCrossAddr = await NovaMemeCross.getAddress();
    await NovaMemeCross['setMemeAxisTokenIds(uint256,uint256)'](1, 1);
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
    let tokenIdList: number[] = [1];
    let amountList: number[] = [2];
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

    let burnTokenId: number[] = [1];
    await aliceMemeCross.safeMint(burnTokenId);
    expect(await NovaMemeAxis.balanceOf(alice.address, 1)).to.equal(1);
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

  it('set burnCount success', async function () {
    expect(aliceMemeCross.setBurnCount(3)).to.be.revertedWith('Ownable: caller is not the owner');
    await ownerMemeCross.setMaxSupply(10);
  });

  it("test 'Invalid tokenId' success", async function () {
    let burnTokenId: number[] = [2];
    await expect(aliceMemeCross.safeMint(burnTokenId)).to.be.revertedWith('Invalid tokenId');
  });

  it("test 'TokenId repeat' success", async function () {
    await ownerMemeCross.setBurnCount(5);
    await NovaMemeCross['setMemeAxisTokenIds(uint256,uint256)'](7, 1);
    await NovaMemeCross['setMemeAxisTokenIds(uint256,uint256)'](8, 1);
    await NovaMemeCross['setMemeAxisTokenIds(uint256,uint256)'](2, 1);
    let burnTokenId: number[] = [1,7,2,8,7];
    await expect(aliceMemeCross.safeMint(burnTokenId)).to.be.revertedWith('TokenId repeat');
  });

  it("test 'TokenIds length must equal to burnCount' sueecss", async function () {
    let burnTokenId: number[] = [1];
    await expect(aliceMemeCross.safeMint(burnTokenId)).to.be.revertedWith('TokenIds length must equal to burnCount');
  });

  it('test transfer success', async function () {
    await aliceMemeCross.safeTransferFrom(alice.address, tom.address, 0);
    expect(await NovaMemeCross.ownerOf(0)).to.equal(tom.address);
  });
});
