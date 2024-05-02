import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaChadNFT',
    [process.env.INFINITY_STONES_ADDRESS],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    },
    [
      'Nova Chad',
      'CHAD',
      'ipfs://QmRCwyATFhU8De99BaxmYBTyTe42VKMx3weSFgL1ktyxpg',
      process.env.MEME_WITNESS_ADDRESS,
      10000,
    ],
  );
}
