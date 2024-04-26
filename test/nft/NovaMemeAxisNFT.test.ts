import { expect } from 'chai';
import { Contract, Wallet, Signer } from 'ethers';
import { upgrades, ethers } from 'hardhat';

describe('NovaMemeAxis', function () {
  let NovaMemeAxisNFT;
  let NovaMemeAxis: Contract;
  let MemeAxisAddr;
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
    NovaMemeAxisNFT = await ethers.getContractFactory('NovaMemeAxisNFT');
    const signers: Signer[] = await ethers.getSigners();
    [owner, alice, tom] = signers as Wallet[];
    NovaMemeAxis = await upgrades.deployProxy(NovaMemeAxisNFT, ['MemeAxis NFT', 'MemeAxis', owner.address], {
      kind: 'uups',
      initializer: 'initialize',
      unsafeAllow: ['constructor'],
    });
    MemeAxisAddr = await NovaMemeAxis.getAddress();
    console.log('NovaMemeAxis deployed to:', MemeAxisAddr);
    console.log('owner addr', owner.address);
  });

  it('mint MemeAxis with sign success', async function () {
    MemeAxisAddr = await NovaMemeAxis.getAddress();
    const domain = {
      name: 'MemeAxis NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: MemeAxisAddr,
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
    await NovaMemeAxis['safeMint(address,uint256,uint256,uint256,uint256,uint256,bytes)'](
      alice.address,
      1,
      1,
      1,
      1742630631000,
      1,
      signature,
    );
    expect(await NovaMemeAxis.balanceOf(alice.address, 1)).to.equal(1);
    expect(await NovaMemeAxis.mintNoncesMap(1, alice.address)).to.equal(1);
    expect(await NovaMemeAxis.mintNoncesMap(2, alice.address)).to.equal(0);
  });

  it("test 'TokenId already minted' success", async function () {
    MemeAxisAddr = await NovaMemeAxis.getAddress();
    const domain = {
      name: 'MemeAxis NFT',
      version: '0',
      chainId: 31337,
      verifyingContract: MemeAxisAddr,
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
      NovaMemeAxis['safeMint(address,uint256,uint256,uint256,uint256,uint256,bytes)'](
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

  it('batchmint MemeAxis with sign success', async function () {
    MemeAxisAddr = await NovaMemeAxis.getAddress();

    let tokenIdList: number[] = [5, 2, 3, 4];
    let amountList: number[] = [2, 2, 2, 2];

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
    expect(await NovaMemeAxis.balanceOf(alice.address, 5)).to.equal(2);
    expect(await NovaMemeAxis.balanceOf(alice.address, 2)).to.equal(2);
    expect(await NovaMemeAxis.balanceOf(alice.address, 3)).to.equal(2);
    expect(await NovaMemeAxis.balanceOf(alice.address, 4)).to.equal(2);
    expect(await NovaMemeAxis.mintNoncesMap(1, alice.address)).to.equal(2);
  });

  it('transfer nft success', async function () {
    const aliceMemeAxis = new ethers.Contract(await NovaMemeAxis.getAddress(), NovaMemeAxis.interface, alice);
    await aliceMemeAxis.safeTransferFrom(alice.address, tom.address, 1, 1, '0x');
    expect(await NovaMemeAxis.balanceOf(alice.address, 1)).to.equal(0);
    expect(await NovaMemeAxis.balanceOf(tom.address, 1)).to.equal(1);
  });

  it('burn nft success', async function () {
    const tomMemeAxis = new ethers.Contract(await NovaMemeAxis.getAddress(), NovaMemeAxis.interface, tom);
    await tomMemeAxis.burn(tom.address, 1, 1);
    expect(await NovaMemeAxis.balanceOf(tom.address, 1)).to.equal(0);
  });

  it('approve nft burn success', async function () {
    const aliceMemeAxis = new ethers.Contract(await NovaMemeAxis.getAddress(), NovaMemeAxis.interface, alice);
    const tomMemeAxis = new ethers.Contract(await NovaMemeAxis.getAddress(), NovaMemeAxis.interface, tom);
    await aliceMemeAxis.setApprovalForAll(tom.address, true);
    await tomMemeAxis.burn(alice.address, 2, 1);
    expect(await NovaMemeAxis.balanceOf(alice.address, 2)).to.equal(1);
  });
});
