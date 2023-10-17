const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Lottery", async () => {
      // tests for local host
      let lottery, vrfCoordinatorV2Mock, lotteryEntranceFee, deployer,interval;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        // deploy mocks and lottery contract
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        lottery = await ethers.getContract("Lottery", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        lotteryEntranceFee = await lottery.getEntranceFee();
        interval = await lottery.getInterval();
      });

      describe("constructor", async () => {
        it("initializes the Lottery Contract correctly", async () => {
          const LotteryState = await lottery.getLotteryState();
          assert.equal(LotteryState.toString(), "0");
          assert.equal(
            interval.toString(),
            networkConfig[chainId]["keepersUpdateInterval"]
          );
        });
      });

      describe("enterLottery", async () => {
        it("reverts when you don't pay enough", async () => {
          await expect(lottery.enterLottery()).to.be.reverted;
        });
        it("records player when they enter", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          const playerFromContract = await lottery.getPlayer(0);
          assert.equal(playerFromContract, deployer);
        });
        it("emits event on enter", async () => {
          await expect(
            lottery.enterLottery({ value: lotteryEntranceFee })
          ).to.emit(lottery, "LotteryEnter");//can use any log
        });
        it("doesn't allow entrance when Lottery is closed",async()=>{
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.request({ method: "evm_mine", params: [] })
          //pretend to be keeper

          await lottery.performUpkeep([])
          await expect(lottery.enterLottery({ value: lotteryEntranceFee })).to.be.reverted;
        })
      });
    });
