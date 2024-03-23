import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaBoosterNFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    ['Nova Booster NFT', '', '0xd14653F6fA807107084e5d8a18bB5Ce3C5BbFB90'],
  );
}
