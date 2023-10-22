const { ethers, network } = require("hardhat");
const fs = require("fs");
const { FRONTEND_ABI_FILE, FRONTEND_ADDRESS_FILE } = require("../helper-hardhat-config");


module.exports = async () => {
  if (process.env.UPDATE_FRONTEND) {
    console.log("Updating frontend...");
    updateContractAddress();
    updateContractAbi();
  }
};

async function updateContractAbi() {
  const lottery = await ethers.getContract("Lottery");
  fs.writeFileSync(FRONTEND_ABI_FILE,lottery.interface.formatJson());
}

async function updateContractAddress() {
  const lottery = await ethers.getContract("Lottery");
  const chainId = network.config.chainId.toString();
  const currentAddress = {}
  currentAddress[chainId]=(await lottery.getAddress()).toString();
  fs.writeFileSync(FRONTEND_ADDRESS_FILE, JSON.stringify(currentAddress));
}
module.exports.tags = ["all", "frontend"];
  