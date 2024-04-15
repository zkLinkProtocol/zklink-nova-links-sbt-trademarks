import { expect } from 'chai';
import { Contract, Wallet, Signer } from 'ethers';
import { upgrades, ethers } from 'hardhat';

describe('NovaComposeNFT', function () {
  let NovaComposeNFT;
  let NovaMemeNFT;
  let NovaCompose: Contract;
  let NovaMeme: Contract;
  let composeAddr;
  let memeAddr;
  let owner: Wallet;
  let alice: Wallet;
  let tom: Wallet;
  let signature;
  let aliceMeme: Contract;
  let aliceCompose: Contract;
  let ownerCompose: Contract;

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
    NovaComposeNFT = await ethers.getContractFactory('NovaComposeNFT');
    NovaMemeNFT = await ethers.getContractFactory('NovaMemeNFT');
    const signers: Signer[] = await ethers.getSigners();
    [owner, alice, tom] = signers as Wallet[];
    NovaMeme = await upgrades.deployProxy(NovaMemeNFT, ['meme NFT', 'meme', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });
    memeAddr = await NovaMeme.getAddress();
    NovaCompose = await upgrades.deployProxy(NovaComposeNFT, ['compose NFT', 'compose', '', owner.address, 2, 1], {
      kind: 'uups',
      initializer: 'initialize',
      constructorArgs: [memeAddr],
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    });
    composeAddr = await NovaCompose.getAddress();
    await NovaCompose['setMemeTokenIds(uint256)'](1);
    console.log('NovaCompose deployed to:', composeAddr);
    console.log('owner addr', owner.address);
  });
  it('mint with sign', async function () {
    composeAddr = await NovaCompose.getAddress();
    let domain = {
      name: 'compose NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: composeAddr,
    };

    let signMessage = {
      to: alice.address,
      nonce: 1,
      expiry: 2675420294000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, types, signMessage);
    await NovaCompose['safeMintWithAuth(address,uint256,uint256,uint256,bytes)'](
      alice.address,
      1,
      2675420294000,
      1,
      signature,
    );
    expect(await NovaCompose.balanceOf(alice.address)).to.equal(1);
    expect(await NovaCompose.mintNoncesMap(1, alice.address)).to.equal(1);
  });

  it('mint with burn meme', async function () {
    memeAddr = await NovaMeme.getAddress();
    let tokenIdList: number[] = [1];
    let amountList: number[] = [2];
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
    expect(await NovaMeme.balanceOf(alice.address, 1)).to.equal(2);

    aliceMeme = new ethers.Contract(await NovaMeme.getAddress(), NovaMeme.interface, alice);
    await aliceMeme.setApprovalForAll(NovaCompose.getAddress(), true);

    aliceCompose = new ethers.Contract(await NovaCompose.getAddress(), NovaCompose.interface, alice);
    ownerCompose = new ethers.Contract(await NovaCompose.getAddress(), NovaCompose.interface, owner);
    let burnTokenId: number[] = [1];
    let burnAmount: number[] = [1];
    await aliceCompose.safeMint(burnTokenId, burnAmount, 1);
    expect(await NovaMeme.balanceOf(alice.address, 1)).to.equal(1);
  });

  it("test 'Exceeds max supply' success", async function () {
    composeAddr = await NovaCompose.getAddress();

    let domain = {
      name: 'compose NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: composeAddr,
    };

    let signMessage = {
      to: alice.address,
      nonce: 2,
      expiry: 2675420294000,
      mintType: 1,
    };
    signature = await owner.signTypedData(domain, types, signMessage);
    await expect(
      NovaCompose['safeMintWithAuth(address,uint256,uint256,uint256,bytes)'](
        alice.address,
        2,
        2675420294000,
        1,
        signature,
      ),
    ).to.be.revertedWith('Exceeds max supply');
  });

  it('set burnmin success', async function () {
    expect(aliceCompose.setBurnCount(3)).to.be.revertedWith('Ownable: caller is not the owner');
    await ownerCompose.setBurnCount(10);
    await ownerCompose.setMaxSupply(10);
  });

  it("test 'Invalid tokenIds and amounts'success", async function () {
    let burnTokenId: number[] = [1];
    let burnAmount: number[] = [2, 2];
    await expect(aliceCompose.safeMint(burnTokenId, burnAmount, 1)).to.be.revertedWith('Invalid tokenIds and amounts');
  });

  it("test 'Invalid tokenId' success", async function () {
    let burnTokenId: number[] = [2];
    let burnAmount: number[] = [1];
    await expect(aliceCompose.safeMint(burnTokenId, burnAmount, 1)).to.be.revertedWith('Invalid tokenId');
  });

  it("test 'Invalid amount' success", async function () {
    let burnTokenId: number[] = [1];
    let burnAmount: number[] = [0];
    await expect(aliceCompose.safeMint(burnTokenId, burnAmount, 1)).to.be.revertedWith('Invalid amount');
  });

  it("test 'Total amount must equal to burnMin' sueecss", async function () {
    let burnTokenId: number[] = [1];
    let burnAmount: number[] = [2];
    await expect(aliceCompose.safeMint(burnTokenId, burnAmount, 1)).to.be.revertedWith(
      'Total amount must equal to burnCount',
    );
  });
});
