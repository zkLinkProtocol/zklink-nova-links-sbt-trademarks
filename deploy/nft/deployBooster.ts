import { deployContract } from '../utils';

export default async function () {
  await deployContract('BoosterNFT', [process.env.WITNESS_ADDRESS, process.env.BOX_CONTRACT_ADDRESS], {
    noVerify: false,
  });
}
