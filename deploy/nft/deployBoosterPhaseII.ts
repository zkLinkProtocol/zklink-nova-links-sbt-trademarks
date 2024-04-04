import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaBoosterPhaseIINFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    ['Nova - Phase II', '', process.env.WITNESS_ADDRESS],
  );
}
