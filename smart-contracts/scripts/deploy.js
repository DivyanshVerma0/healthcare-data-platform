const hre = require("hardhat");

async function main() {
  const MedicalRecord = await hre.ethers.getContractFactory("MedicalRecord");
  const medicalRecord = await MedicalRecord.deploy();

  await medicalRecord.deployed();

  console.log("MedicalRecord deployed to:", medicalRecord.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });