import { expect } from 'chai';
import { Contract, Wallet, Signer } from 'ethers';
import { upgrades, ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'ethers';
import assert from 'assert';

describe('NovaCuboNFT', function () {
  let novaCuboNFT: Contract;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let cuboAddr: string;

  const MintAuthType = {
    MintAuth: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'stage', type: 'string' },
    ],
  };

  interface DomainData {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  }

  interface MintInfo {
    to: string;
    tokenId: number;
    amount: number;
    nonce: number;
    expiry: number;
    stage: string;
  }

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    console.log('owner address: ', owner.address);
    console.log('addr1 address: ', addr1.address);
    console.log('addr2 address: ', addr2.address);

    const NovaCuboNFTFactory = await ethers.getContractFactory('NovaCuboNFT');
    novaCuboNFT = await upgrades.deployProxy(
      NovaCuboNFTFactory,
      [
        10,
        2,
        'Cubo the Block',
        'CUBO',
        'https://zklink-nova-nft.s3.ap-northeast-1.amazonaws.com/cubonft/',
        [
          {
            enableSig: true,
            limitationForAddress: 0,
            maxSupplyForStage: 3,
            startTime: 1725897600,
            endTime: 1915200000,
            price: ethers.parseEther('0.00001'),
            paymentToken: '0x0000000000000000000000000000000000000000',
            payeeAddress: owner.address,
            allowListMerkleRoot: '0x55e8063f883b9381398d8fef6fbae371817e8e4808a33a4145b8e3cdd65e3926',
            stage: 'Allowlist',
            mintType: 1,
          },
          {
            enableSig: true,
            limitationForAddress: 0,
            maxSupplyForStage: 7,
            startTime: 1725897600,
            endTime: 1915200000,
            price: ethers.parseEther('0.00001'),
            paymentToken: '0x0000000000000000000000000000000000000000',
            payeeAddress: '0xF0DB7cE565Cd7419eC2e6548603845a648f6594F',
            allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
            stage: 'Public',
            mintType: 0,
          },
        ],
      ],
      {
        kind: 'uups',
        initializer: 'initialize',
        unsafeAllow: ['constructor', 'state-variable-immutable'],
      },
    );
    cuboAddr = await novaCuboNFT.getAddress();
    console.log('Cubo address: ', cuboAddr);
    novaCuboNFT.setActiveSigner(owner, true);
  });

  describe('Initialization', function () {
    it('should set the correct owner', async function () {
      expect(await novaCuboNFT.owner()).to.equal(owner.address);
    });
  });

  describe('Minting', function () {
    it('should allow minting', async function () {
      const stage = 'Allowlist';
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const signature = await getSignature(owner, 31337, cuboAddr, addr1.address, 2, 1, 0, expiry, stage);
      const proof = getMerkleProof([owner.address, addr1.address, addr2.address], addr1.address);
      const mintParams = {
        to: addr1.address,
        amount: 2,
        tokenId: 1,
        nonce: 0,
        expiry: expiry,
      };

      await novaCuboNFT.mint(stage, signature, proof, mintParams, { value: ethers.parseEther('0.00002') });
      expect(await novaCuboNFT.balanceOf(addr1.address)).to.equal(2);
    });

    it('should revert if minting exceeds perAddress limit', async function () {
      const stage = 'Allowlist';
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const signature = await getSignature(owner, 31337, cuboAddr, addr1.address, 1, 3, 1, expiry, stage);
      const proof = getMerkleProof([owner.address, addr1.address, addr2.address], addr1.address);
      const mintParams = {
        to: addr1.address,
        amount: 1,
        tokenId: 3,
        nonce: 1,
        expiry: expiry,
      };

      await expect(
        novaCuboNFT.mint(stage, signature, proof, mintParams, { value: ethers.parseEther('0.00001') }),
      ).to.be.revertedWithCustomError(novaCuboNFT, 'ExceedPerAddressLimit()');
    });

    it('should revert if minting exceeds stage limit', async function () {
      const stage = 'Allowlist';
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const signature = await getSignature(owner, 31337, cuboAddr, addr2.address, 2, 3, 1, expiry, stage);
      const proof = getMerkleProof([owner.address, addr1.address, addr2.address], addr2.address);
      const mintParams = {
        to: addr2.address,
        amount: 2,
        tokenId: 3,
        nonce: 1,
        expiry: expiry,
      };

      await expect(
        novaCuboNFT.mint(stage, signature, proof, mintParams, { value: ethers.parseEther('0.00002') }),
      ).to.be.revertedWithCustomError(novaCuboNFT, 'ExceedMaxSupplyForStage()');
    });

    it('public stage should allow minting', async function () {
      const stage = 'Public';
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const signature = await getSignature(owner, 31337, cuboAddr, addr2.address, 1, 3, 2, expiry, stage);
      const proof = [0x00];
      const mintParams = {
        to: addr2.address,
        amount: 1,
        tokenId: 3,
        nonce: 2,
        expiry: expiry,
      };

      await novaCuboNFT.mint(stage, signature, proof, mintParams, { value: ethers.parseEther('0.00001') });
      expect(await novaCuboNFT.balanceOf(addr2.address)).to.equal(1);
    });
  });

  const getSignature = async function (
    signer: Wallet,
    chainId: number,
    verifyContract: string,
    to: string,
    amount: number,
    tokenId: number,
    nonce: number,
    expiry: number,
    stage: string,
  ): Promise<string> {
    const domainData: DomainData = {
      name: 'OKXMint',
      version: '1.0',
      chainId: chainId,
      verifyingContract: verifyContract,
    };

    const mintInfo: MintInfo = {
      to: to,
      tokenId: tokenId,
      amount: amount,
      nonce: nonce,
      expiry: expiry,
      stage: stage,
    };

    const signature = await signer.signTypedData(domainData, MintAuthType, mintInfo);
    return signature;
  };

  const getMerkleProof = function (allowlist: string[], toHex: string): string[] {
    const index = allowlist.indexOf(toHex);
    assert(index >= 0, `${toHex} not found in allowlist`);

    const leaves = allowlist.map(x => keccak256(x));
    const merkleTree = new MerkleTree(leaves, keccak256, {
      sortLeaves: false,
      sortPairs: true,
    });

    const toLeaf = keccak256(toHex);
    const proof = merkleTree.getHexProof(toLeaf);
    return proof;
  };
});
