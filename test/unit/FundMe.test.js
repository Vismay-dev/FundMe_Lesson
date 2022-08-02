const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { expect, assert } = require("chai");
const { developerChains } = require("../../helper-hardhat-config");

!developerChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe;
      let deployer;
      let mockV3Aggregator;

      const sentValue = ethers.utils.parseEther("10");

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("Constructor", async () => {
        it("Sets aggregator addresses correctly", async () => {
          assert.equal(await fundMe.getPriceFeed(), mockV3Aggregator.address);
        });
      });

      describe("Fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "FundMe__insufficient"
          );
        });
        it("Updates fund amount data", async () => {
          await fundMe.fund({ value: sentValue });
          assert.equal(
            (await fundMe.getAddressToAmountFunded(deployer)).toString(),
            sentValue.toString()
          );
        });
        it("Adds funder data", async () => {
          await fundMe.fund({ value: sentValue });
          assert.equal(await fundMe.getFunders(0), deployer);
        });
      });

      describe("Withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sentValue });
        });

        it("Can withdraw ETH from a single funder", async () => {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const tx = await fundMe.withdraw();
          const txReceipt = await tx.wait(1);

          const gasCost = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Can withdraw ETH from a multiple getFunders", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);

            await fundMeConnectedContract.fund({ value: sentValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const tx = await fundMe.withdraw();
          const txReceipt = await tx.wait(1);

          const gasCost = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allows owner to withdraw funds", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__notOwner"
          );
        });
      });
    });
