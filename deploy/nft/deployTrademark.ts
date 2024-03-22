import { deployContract } from '../utils';

export default async function () {
  await deployContract('NovaTrademarkNFT', [], {
    noVerify: false,
    upgradable: true,
    kind: "uups",
    unsafeAllow: ["constructor"]
  }, ["Nova Trademark NFT", "", "0xd14653F6fA807107084e5d8a18bB5Ce3C5BbFB90"]);
}
