const { assert } = require("chai");
const { ethers, getNamedAccounts } = require("hardhat");
const { developerChains } = require("../../helper-hardhat-config");

developerChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe;
      let deployer;
      const sentValue = ethers.utils.parseEther("0.1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allows people to fund & withdraw", async () => {
        await fundMe.fund({ value: sentValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
