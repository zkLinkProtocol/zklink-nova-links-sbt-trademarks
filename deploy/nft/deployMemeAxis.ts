import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaMemeAxisNFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    ['Nova MemeAxis', 'MENEAXIS', process.env.WITNESS_ADDRESS],
  );
}
