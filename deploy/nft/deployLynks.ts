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
    [
      'Nova Lynks',
      'LYNKS',
      'https://zklink-nova-nft.s3.ap-northeast-1.amazonaws.com/lynknft/',
      process.env.WITNESS_ADDRESS,
    ],
  );
}
