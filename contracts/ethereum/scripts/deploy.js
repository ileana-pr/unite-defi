const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FusionBridge to Ethereum...");

  // Get the contract factory
  const FusionBridge = await hre.ethers.getContractFactory("FusionBridge");

  // For now, we'll use a placeholder address for the Fusion+ resolver
  // In production, this would be the actual 1inch Fusion+ resolver address
  const fusionResolverAddress = "0x0000000000000000000000000000000000000000"; // Placeholder

  console.log("📋 Deploying with parameters:");
  console.log(`   Fusion+ Resolver: ${fusionResolverAddress}`);

  // Deploy the contract
  const fusionBridge = await FusionBridge.deploy(fusionResolverAddress);

  // Wait for deployment to complete
  await fusionBridge.waitForDeployment();

  const address = await fusionBridge.getAddress();
  console.log("✅ FusionBridge deployed successfully!");
  console.log(`   Contract Address: ${address}`);
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Explorer: https://${hre.network.name === 'mainnet' ? 'etherscan.io' : 'sepolia.etherscan.io'}/address/${address}`);

  // Verify the contract on Etherscan (if not on localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [fusionResolverAddress],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
    }
  }

  // Log deployment info
  console.log("\n📊 Deployment Summary:");
  console.log(`   Contract: FusionBridge`);
  console.log(`   Address: ${address}`);
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Fusion+ Resolver: ${fusionResolverAddress}`);
  console.log(`   Bridge Fee: 0.1% (10 basis points)`);
  console.log(`   Supported Chains: Ethereum, Aptos`);

  return fusionBridge;
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});