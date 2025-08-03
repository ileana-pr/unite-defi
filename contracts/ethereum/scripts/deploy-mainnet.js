const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FusionBridge to Ethereum Mainnet...");

  // Get the signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log("📋 Account balance:", await hre.ethers.provider.getBalance(deployer.address));

  // For now, we'll use a placeholder address for the Fusion+ resolver
  const fusionResolverAddress = "0x0000000000000000000000000000000000000000";

  console.log("📋 Deploying with parameters:");
  console.log(`   Fusion+ Resolver: ${fusionResolverAddress}`);

  try {
    // Get current gas price
    console.log("🔧 Getting current gas price...");
    const gasPrice = await hre.ethers.provider.getFeeData();
    console.log("📊 Current gas price:", hre.ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");

    // Get the contract factory
    const FusionBridge = await hre.ethers.getContractFactory("FusionBridge");

    // Deploy with explicit gas settings for mainnet
    console.log("🔧 Deploying contract with mainnet-optimized settings...");
    const fusionBridge = await FusionBridge.deploy(fusionResolverAddress, {
      gasLimit: 3000000, // Higher gas limit for mainnet
      maxFeePerGas: gasPrice.maxFeePerGas || gasPrice.gasPrice,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas || hre.ethers.parseUnits("2", "gwei")
    });

    console.log("⏳ Waiting for deployment...");
    await fusionBridge.waitForDeployment();

    const address = await fusionBridge.getAddress();
    console.log("✅ FusionBridge deployed successfully!");
    console.log(`   Contract Address: ${address}`);
    console.log(`   Network: ${hre.network.name}`);
    console.log(`   Explorer: https://etherscan.io/address/${address}`);

    // Verify the contract on Etherscan
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

    // Log deployment info
    console.log("\n📊 Deployment Summary:");
    console.log(`   Contract: FusionBridge`);
    console.log(`   Address: ${address}`);
    console.log(`   Network: ${hre.network.name}`);
    console.log(`   Fusion+ Resolver: ${fusionResolverAddress}`);
    console.log(`   Bridge Fee: 0.1% (10 basis points)`);
    console.log(`   Supported Chains: Ethereum, Aptos`);

    return fusionBridge;
  } catch (error) {
    console.error("❌ Deployment failed with error:", error);
    throw error;
  }
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 