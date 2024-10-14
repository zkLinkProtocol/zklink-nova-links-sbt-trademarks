import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaGenesisPassPhaseIINFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor'],
  });
}
