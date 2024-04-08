import { expect } from 'chai';
const { ethers } = require('hardhat');
import { Contract, Wallet } from 'ethers';
import { upgrades } from 'hardhat';

describe('NovaBoosterPhaseIINFT', function () {
    let NovaBoosterPhaseIINFT;
    let Booster: Contract;
    let tradeAddr;
    let owner: Wallet;
    let addr1: Wallet;
    let addr2: Wallet;
    let signature;
  
    before(async function () {
      NovaBoosterPhaseIINFT = await ethers.getContractFactory('NovaBoosterPhaseIINFT');
      [owner, addr1, addr2] = await ethers.getSigners();
      console.log('owner:', owner.address);
      console.log('addr1:', addr1.address);
      console.log('addr2:', addr2.address);
  
      // deploy Booster
      Booster = await upgrades.deployProxy(NovaBoosterPhaseIINFT, ['Booster', '', owner.address], {
        kind: 'uups',
        initializer: 'initialize',
        unsafeAllow: ['constructor'],
      });
      tradeAddr = await Booster.getAddress();
    });

    it('mint TradeMark with sign success', async function () {
        tradeAddr = await Booster.getAddress();
        const domain = {
          name: 'Booster',
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
    
        // mint Booster
        signature = await owner.signTypedData(domain, types, message1);
        await Booster['safeMint(address,uint256,uint256,uint256,uint256,bytes)'](
          addr1.address,
          1,
          1,
          1,
          1742630631000,
          signature,
        );
        expect(await Booster.balanceOf(addr1.address, 1)).to.equal(1);
      });
    
      it('safeMintCommon success', async function () {
        tradeAddr = await Booster.getAddress();
        const domain = {
          name: 'Booster',
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
          amount: 2,
          expiry: 1742630631000,
        };
    
        // mint Booster
        signature = await owner.signTypedData(domain, types, message1);
        
        await Booster['safeMintCommon(address,uint256,uint256,uint256,uint256,bytes,uint256)'](
          addr1.address,
          1,
          1,
          2,
          1742630631000,
          signature,
          3
        );
    
        message1 = {
          to: addr1.address,
          nonce: 1,
          tokenId: 1,
          amount: 3,
          expiry: 1742630631000,
        };
    
        signature = await owner.signTypedData(domain, types, message1);
        // mint nft by safeMintCommon
        await Booster['safeMintCommon(address,uint256,uint256,uint256,uint256,bytes,uint256)'](
          addr1.address,
          1,
          1,
          3,
          1742630631000,
          signature,
          4
        );
    
        expect(await Booster.balanceOf(addr1.address, 1)).to.equal(6);
        expect(await Booster.mintNoncesMap(3,addr1.address)).to.equal(1);
        expect(await Booster.mintNoncesMap(4,addr1.address)).to.equal(1);
        expect(await Booster.typeMinted(3)).to.equal(true);
        expect(await Booster.typeMinted(4)).to.equal(true);
        expect(await Booster.getMintNonceOne(addr1.address)).to.equal(1);
    
      });
});