import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'FullNovaNFT',
    [process.env.WITNESS_ADDRESS, process.env.TRADEMARK_CONTRACT_ADDRESS, process.env.NOVA_NFT_CONTRACT_ADDRESS],
    {
      noVerify: false,
    },
  );
}
