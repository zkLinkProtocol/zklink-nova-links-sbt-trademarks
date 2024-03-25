import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaLynksNFT',
    [process.env.SBT_CONTRACT_ADDRESS, process.env.TRADEMARK_CONTRACT_ADDRESS],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor', 'state-variable-immutable'],
    },
    ['Nova Lynks', 'LYNKS', '', process.env.WITNESS_ADDRESS],
  );
}
