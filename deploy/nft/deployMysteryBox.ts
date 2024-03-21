import { deployContract } from '../utils';

export default async function () {
  await deployContract('MysteryBoxNFT', [process.env.WITNESS_ADDRESS], {
    noVerify: false,
  });
}
