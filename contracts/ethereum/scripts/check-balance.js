const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking wallet balance...");
  
  const walletAddress = "0x8324d116f3D2ef26182d355fEAd00Abaa64dcD90";
  const balance = await hre.ethers.provider.getBalance(walletAddress);
  
  console.log(`📋 Wallet: ${walletAddress}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH`);
  console.log(`💰 Balance (Wei): ${balance.toString()}`);
  
  // Check if we have enough for deployment (we know from earlier estimate it's ~0.000045 ETH)
  const estimatedGasCost = hre.ethers.parseEther("0.0001");
  if (balance > estimatedGasCost) {
    console.log("✅ Sufficient balance for deployment");
  } else {
    console.log("❌ Insufficient balance for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 