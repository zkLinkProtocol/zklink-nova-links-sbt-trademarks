import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaLynksNFT',
    ['0x3E4E2F5f1AFce2b048C73bd2C17C361997066716', '0xA594bF8Ec851a7c58a348DF81Bb311cE0BCAD5C4'],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    },
    ['Nova Lynks NFT', 'NLN', '', '0xd14653F6fA807107084e5d8a18bB5Ce3C5BbFB90'],
  );
}
