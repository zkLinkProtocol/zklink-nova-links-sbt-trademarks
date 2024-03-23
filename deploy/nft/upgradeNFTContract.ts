import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaBoosterNFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor'],
  });
}
