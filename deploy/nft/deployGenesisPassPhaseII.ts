import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaGenesisPassPhaseIINFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    [
      'Cubo the Block',
      'CUBO',
      'https://zklink-nova-nft.s3.ap-northeast-1.amazonaws.com/cubonft/',
      100001,
      process.env.GENESISPASS_PHASEII_WITNESS_ADDRESS,
    ],
  );
}
