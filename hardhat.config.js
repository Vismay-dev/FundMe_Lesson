require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */

const RINKEDBY_RPC = process.env.RINKEDBY_RPC;
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const ETHERSCAN_VERIFY_KEY = process.env.ETHERSCAN_VERIFY_KEY;
const CMC_KEY = process.env.CMC_KEY;

module.exports = {
  solidity: {
    compilers: [{ version: "0.7.0" }, { version: "0.8.15" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkedby: {
      url: RINKEDBY_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_VERIFY_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: CMC_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
};
