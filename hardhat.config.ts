import { HardhatUserConfig } from 'hardhat/config';

import '@matterlabs/hardhat-zksync-node';
import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import '@matterlabs/hardhat-zksync-verify';

const config: HardhatUserConfig = {
  defaultNetwork: 'zklinkNovaGoerliTestnet',
  networks: {
    zklinkNovaGoerliTestnet: {
      url: 'https://goerli.rpc.zklink.io',
      ethNetwork: 'goerli',
      zksync: true,
      verifyURL: 'https://goerli.explorer.zklink.io/contract_verification',
    },
    zkLinkNovaMainnet: {
      url: 'https://rpc.zklink.io',
      ethNetwork: 'mainnet',
      zksync: true,
      verifyURL: 'https://explorer.zklink.io/contract_verification',
    },
    hardhat: {
      zksync: true,
    },
  },
  zksolc: {
    version: '1.3.22',
    settings: {
      // find all available options in the official documentation
      // https://era.zksync.io/docs/tools/hardhat/hardhat-zksync-solc.html#configuration
    },
  },
  solidity: {
    version: '0.8.20',
  },
};

export default config;
