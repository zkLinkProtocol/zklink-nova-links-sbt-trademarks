import { ethers } from 'ethers';
import { deployContract } from '../utils';

export default async function () {
  await deployContract(
    'NovaCuboNFT',
    [],
    {
      noVerify: false,
      upgradable: true,
      kind: 'uups',
      unsafeAllow: ['constructor'],
    },
    [
      100000,
      2,
      50169,
      'Cubo the Block',
      'CUBO',
      'https://zklink-nova-nft.s3.ap-northeast-1.amazonaws.com/cubonft/',
      [
        {
          enableSig: true,
          limitationForAddress: 100,
          maxSupplyForStage: 20000,
          startTime: process.env.CUBO_STARTTIME,
          endTime: process.env.CUBO_ENDTIME,
          price: ethers.parseEther('0.00001'),
          paymentToken: '0x0000000000000000000000000000000000000000',
          payeeAddress: process.env.CUBO_PAYEE_ADDRESS,
          allowListMerkleRoot: process.env.CUBO_ALLOWLIST_MERKLEROOT,
          stage: 'Allowlist',
          mintType: 1,
        },
        {
          enableSig: true,
          limitationForAddress: 100,
          maxSupplyForStage: 80000,
          startTime: process.env.CUBO_STARTTIME,
          endTime: process.env.CUBO_ENDTIME,
          price: ethers.parseEther('0.00001'),
          paymentToken: '0x0000000000000000000000000000000000000000',
          payeeAddress: process.env.CUBO_PAYEE_ADDRESS,
          allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
          stage: 'Public',
          mintType: 0,
        },
      ],
    ],
  );
}
