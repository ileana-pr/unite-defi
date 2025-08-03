const hre = require("hardhat");

async function main() {
  console.log("🔍 Estimating deployment cost...");
  
  try {
    // Get current gas price
    const feeData = await hre.ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;
    
    console.log(`📊 Current gas price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
    
    // Get contract bytecode size
    const contractArtifact = await hre.artifacts.readArtifact("FusionBridge");
    const bytecodeSize = contractArtifact.bytecode.length / 2 - 1; // Remove '0x' prefix and divide by 2 for hex
    
    console.log(`📦 Contract bytecode size: ${bytecodeSize} bytes`);
    
    // Estimate gas for deployment (base cost + bytecode cost)
    const baseCost = 21000n; // Base transaction cost
    const bytecodeCost = BigInt(bytecodeSize) * 16n; // 16 gas per byte
    const constructorCost = 20000n; // Estimated constructor execution cost
    const estimatedGas = baseCost + bytecodeCost + constructorCost;
    
    console.log(`⛽ Estimated gas needed: ${estimatedGas.toLocaleString()}`);
    
    // Calculate cost in ETH
    const estimatedCostWei = estimatedGas * gasPrice;
    const estimatedCostEth = hre.ethers.formatEther(estimatedCostWei);
    
    console.log(`💰 Estimated deployment cost: ${estimatedCostEth} ETH`);
    console.log(`💰 Estimated deployment cost (USD): $${(parseFloat(estimatedCostEth) * 3000).toFixed(2)} (assuming $3000/ETH)`);
    
    // Check if we have enough balance
    const walletAddress = "0x2Ae9070b029D05d8E6516aEc0475002C53595a9d";
    const balance = await hre.ethers.provider.getBalance(walletAddress);
    const balanceEth = hre.ethers.formatEther(balance);
    
    console.log(`\n📋 Wallet: ${walletAddress}`);
    console.log(`💰 Current balance: ${balanceEth} ETH`);
    
    if (estimatedCostWei <= balance) {
      console.log("✅ Sufficient balance for deployment!");
    } else {
      const shortfall = estimatedCostWei - balance;
      const shortfallEth = hre.ethers.formatEther(shortfall);
      console.log(`❌ Insufficient balance. Need ${shortfallEth} more ETH`);
    }
    
    // Add 20% buffer for safety
    const safeEstimate = estimatedCostWei * 120n / 100n;
    const safeEstimateEth = hre.ethers.formatEther(safeEstimate);
    console.log(`\n🛡️  Safe estimate (with 20% buffer): ${safeEstimateEth} ETH`);
    
  } catch (error) {
    console.error("❌ Error estimating cost:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 