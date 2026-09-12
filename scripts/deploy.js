// Hardhat deploy script (ethers v6)
// https://hardhat.org/docs/guides/deployment/using-scripts
// https://docs.ethers.org/v6/api/contract/

const { ethers } = require("hardhat");

const deploy = async () => {
  try {
    // Фабрика контракту з artifacts
    const factory = await ethers.getContractFactory("Forum");
    
    // Відправка deploy-транзакції
    const contract = await factory.deploy();

    // Очікування включення в блок
    // https://docs.ethers.org/v6/api/contract/#BaseContract-waitForDeployment
    await contract.waitForDeployment();

    // Адреса задеплоєного контракту
    // https://docs.ethers.org/v6/api/contract/#BaseContract-getAddress
    console.log("Contract address:", await contract.getAddress());
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
};

deploy();
