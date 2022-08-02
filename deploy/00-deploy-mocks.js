const { network } = require("hardhat");
const { developerChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developerChains.includes(network.name)) {
    log("- Local Network Detected - Deploying Mocks");
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [8, 200000000000],
    });
    log("- Mocks Deployed");
    log("-------- ------ ------- ------- -------- -------- -------");
  }
};

module.exports.tags = ["all", "mocks"];
