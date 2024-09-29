import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaGenesisPassPhaseIIINFT',
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
      process.env.GENESISPASS_PHASEIII_HARDTOP_LIMIT,
      process.env.GENESISPASS_PHASEIII_WITNESS_ADDRESS,
      process.env.GENESISPASS_PHASEII_MINTPRICE,
    ],
  );
}
