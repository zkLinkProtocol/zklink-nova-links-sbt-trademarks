import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import '@matterlabs/hardhat-zksync-verify';
import '@matterlabs/hardhat-zksync-upgradable';
import 'hardhat-abi-exporter';

const config: HardhatUserConfig = {
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    only: ['contracts/.*.sol'],
    format: 'json',
  },
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
      zksync: false,
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
    compilers: [
      {
        version: '0.8.23',
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};

export default config;
