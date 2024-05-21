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
    ['Nova Genesis Pass NFT', 'NGP', '', 150000, process.env.GENESISPASS_PHASEII_WITNESS_ADDRESS],
  );
}
