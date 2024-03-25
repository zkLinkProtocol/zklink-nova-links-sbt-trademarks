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
    ['Nova Booster', '', process.env.WITNESS_ADDRESS],
  );
}
