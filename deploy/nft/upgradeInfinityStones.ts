import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaInfinityStonesNFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor'],
  });
}
