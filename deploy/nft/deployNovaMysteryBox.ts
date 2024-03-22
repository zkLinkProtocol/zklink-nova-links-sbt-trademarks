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
        ['Nova Mystery Box NFT', 'NMB', '', '0x8f9FAc43A6740Eba56b89d146841c5ED2D3665DD'],
    );
}
