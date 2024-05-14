import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaLynksNFT', [process.env.SBT_CONTRACT_ADDRESS, process.env.TRADEMARK_CONTRACT_ADDRESS], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor', 'state-variable-immutable'],
  });
}
