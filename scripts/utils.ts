import { Wallet } from 'ethers';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'ethers';
import assert from 'assert';

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

export const getSignature = async function (
  signer: Wallet,
  chainId: number,
  verifyContract: string,
  to: string,
  tokenId: number,
  amount: number,
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

export const getMerkleProof = function (allowlist: string[], toHex: string): string[] {
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
