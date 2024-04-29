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
      'https://zklink-nova-nft.s3.ap-northeast-1.amazonaws.com/Chad/0',
      process.env.WITNESS_ADDRESS,
      10000,
    ],
  );
}
