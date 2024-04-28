import { upgradeContract } from '../utils';

export default async function () {
  await upgradeContract('NovaChadNFT', [process.env.INFINITY_STONES_ADDRESS], {
    noVerify: false,
    upgradable: true,
    unsafeAllow: ['constructor', 'state-variable-immutable'],
  });
}
