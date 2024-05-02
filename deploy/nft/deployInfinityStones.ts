import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaInfinityStonesNFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    ['Nova Infinity Stones', '', process.env.MEME_WITNESS_ADDRESS],
  );
}
