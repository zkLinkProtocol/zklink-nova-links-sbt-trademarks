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
    [
      'Nova MemeCross',
      'MEMECROSS',
      'https://zklink-nova-nft.s3.ap-northeast-1.amazonaws.com/MemeCross-test/0',
      process.env.WITNESS_ADDRESS,
      10000,
    ],
  );
}
