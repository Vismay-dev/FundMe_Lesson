const { network } = require("hardhat");
const { networkConfig, developerChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeed;

  if (developerChains.includes(network.name)) {
    const ethUsdAgg = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeed = ethUsdAgg.address;
  } else {
    ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeed],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developerChains.includes(network.name) &&
    process.env.ETHERSCAN_VERIFY_KEY !== null
  ) {
    await verify(fundMe.address, [ethUsdPriceFeed]);
  }

  log("-------- ------ ------- ------- -------- -------- -------");
};

module.exports.tags = ["all", "fundme"];
