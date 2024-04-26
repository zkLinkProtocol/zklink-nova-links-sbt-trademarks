import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaMemeAxisNFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor'],
  });
}
