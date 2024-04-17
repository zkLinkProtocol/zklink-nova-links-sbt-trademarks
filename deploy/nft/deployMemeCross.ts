import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaMemeCrossNFT',
    [process.env.MEME_AXIS_CONTRACT_ADDRESS],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    },
    ['Nova MemeCross', 'MEMECROSS', '', process.env.WITNESS_ADDRESS, 10000, 2],
  );
}
