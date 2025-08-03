const { ethers } = require("hardhat");

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log("🔍 Wallet Information:");
  console.log("Address:", wallet.address);
  
  // Get balance
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  // Check if we have enough for deployment (estimate ~0.01 ETH)
  const minRequired = ethers.parseEther("0.01");
  if (balance < minRequired) {
    console.log("❌ Insufficient balance for deployment");
    console.log("Need at least 0.01 ETH, have:", ethers.formatEther(balance), "ETH");
  } else {
    console.log("✅ Sufficient balance for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 