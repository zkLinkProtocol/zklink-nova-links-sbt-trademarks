import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaGenesisPassPhaseIIINFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor'],
  });
}
