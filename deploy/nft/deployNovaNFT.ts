import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaNFT',
    [process.env.WITNESS_ADDRESS],
    {
      noVerify: false,
    },
  );
}
