import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaBoosterPhaseIINFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor'],
  });
}