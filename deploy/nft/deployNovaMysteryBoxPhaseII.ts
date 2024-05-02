import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaMysteryBoxPhaseIINFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    [
      'Nova Mystery Box - Phase II',
      'MYSTERYBOX II',
      'ipfs://QmYywhGaPuJmoYw7ab7rxBaFiMn8sYmbkDwWsGYKArx2RN',
      process.env.PHASEII_WITNESS_ADDRESS,
    ],
  );
}
