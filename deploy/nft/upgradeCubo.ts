import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaCuboNFT', [], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor', 'state-variable-immutable'],
  });
}
