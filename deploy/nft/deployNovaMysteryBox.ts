import { deployContract } from '../utils';

export default async function () {
    await deployContract(
        'NovaMysteryBoxNFT',
        [],
        {
            noVerify: false,
            upgradable: true,
            kind: "uups",
            unsafeAllow: ["constructor"]
        },
        ['Nova Mystery Box NFT', 'NMB', '', '0xd14653F6fA807107084e5d8a18bB5Ce3C5BbFB90'],
    );
}
