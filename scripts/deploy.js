const { ethers } = require("hardhat");

const deploy = async () => {
  try {
    const factory = await ethers.getContractFactory("Forum");
    const contract = await factory.deploy();

    await contract.waitForDeployment();

    console.log("Contract address:", await contract.getAddress());
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
};

deploy();
