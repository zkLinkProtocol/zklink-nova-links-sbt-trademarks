import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaMysteryBoxNFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    [
      'Nova Mystery Box',
      'MYSTERYBOX',
      'ipfs://QmaocxsiLmVCHqNi5AEwZxWgZfrZAZwySvNXQkDdpk1o9w/MysteryBox.json',
      process.env.WITNESS_ADDRESS,
    ],
  );
}
