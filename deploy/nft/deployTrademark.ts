import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaTrademarkNFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    ['Nova Trademarks', '', process.env.WITNESS_ADDRESS],
  );
}
