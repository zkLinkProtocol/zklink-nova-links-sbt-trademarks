import { expect, assert } from 'chai';
import { Contract, Wallet } from 'zksync-ethers';

import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../../deploy/utils';

import { getSignature } from '../../deploy/witness';

describe('Nova NFT', function () {
  let nftContract: Contract;
  let ownerWallet: Wallet;
  let recipientWallet: Wallet;
  let otherWallet: Wallet;

  before(async function () {
    ownerWallet = getWallet();
    // ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    recipientWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    otherWallet = getWallet(LOCAL_RICH_WALLETS[3].privateKey);

    nftContract = await deployContract(
      'NovaNFT',
      [],
      { wallet: ownerWallet, silent: true, noVerify: true, upgradable: true },
      [ownerWallet.address],
    );
  });

  it('Should mint a new NFT to the recipient', async function () {
    let nonce = 1;
    const expiry = 1711155895;

    const address = ownerWallet.address;

    const signature = getSignature(address, `NOVA-SBT-1-${nonce}`, ownerWallet.privateKey || '');

    const tx = await nftContract['safeMint(address, string, bytes, string, uint256)'](
      address,
      '0',
      signature,
      String(nonce),
      expiry,
    );
    await tx.wait();

    const balance = await nftContract.totalSupply();
    expect(balance).to.equal(BigInt('1'));

    const balanceOfRecipient = await nftContract.balanceOf(address);
    expect(balanceOfRecipient).to.equal(BigInt('1'));
  });

  it('Should not mint using the same signature', async function () {
    try {
      let nonce = 1;
      const expiry = 1711155895;

      const address = ownerWallet.address;

      const signature = getSignature(address, `NOVA-SBT-1-${nonce}`, ownerWallet.privateKey || '');

      const tx = await nftContract['safeMint(address, string, bytes, string, uint256)'](
        address,
        '0',
        signature,
        String(nonce),
        expiry,
      );
      await tx.wait();
      expect.fail('Should not reach here');
    } catch (error) {
      expect(error.message).to.include('Used Signature');
    }
  });

  it('Should only allow one user have one NFT', async function () {
    try {
      let nonce = 2;
      const expiry = 1711155895;

      const address = ownerWallet.address;

      const signature = getSignature(address, `NOVA-SBT-1-${nonce}`, ownerWallet.privateKey || '');

      const tx = await nftContract['safeMint(address, string, bytes, string, uint256)'](
        address,
        '0',
        signature,
        String(nonce),
        expiry,
      );
    } catch (error) {
      expect(error.message).to.include('You already have a character');
    }
  });

  it('Should mint a new NFT to the recipient', async function () {
    let nonce = 3;
    const expiry = 1711155895;

    const address = otherWallet.address;

    const signature = getSignature(address, `NOVA-SBT-1-${nonce}`, ownerWallet.privateKey || '');

    const tx = await nftContract['safeMint(address, string, bytes, string, uint256)'](
      address,
      '0',
      signature,
      String(nonce),
      expiry,
    );
    await tx.wait();

    const balance = await nftContract.totalSupply();
    expect(balance).to.equal(BigInt('2'));

    const balanceOfRecipient = await nftContract.balanceOf(address);
    expect(balanceOfRecipient).to.equal(BigInt('1'));
  });
});
