import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaTrademarkNFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor'],
  });
}
