const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FusionBridge to Ethereum (Manual Method)...");

  // Get the signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log("📋 Account balance:", await hre.ethers.provider.getBalance(deployer.address));

  // For now, we'll use a placeholder address for the Fusion+ resolver
  const fusionResolverAddress = "0x0000000000000000000000000000000000000000";

  console.log("📋 Deploying with parameters:");
  console.log(`   Fusion+ Resolver: ${fusionResolverAddress}`);

  try {
    // Manual deployment approach
    console.log("🔧 Compiling contract...");
    await hre.run("compile");

    console.log("🔧 Getting contract bytecode and ABI...");
    const contractPath = "contracts/FusionBridge.sol:FusionBridge";
    const contractArtifact = await hre.artifacts.readArtifact("FusionBridge");
    
    console.log("🔧 Creating deployment transaction...");
    
    // Encode constructor parameters
    const constructorArgs = [fusionResolverAddress];
    const factory = new hre.ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      deployer
    );

    console.log("🔧 Deploying contract...");
    const contract = await factory.deploy(...constructorArgs);
    
    console.log("⏳ Waiting for deployment...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ FusionBridge deployed successfully!");
    console.log(`   Contract Address: ${address}`);
    console.log(`   Network: ${hre.network.name}`);
    console.log(`   Explorer: https://${hre.network.name === 'mainnet' ? 'etherscan.io' : 'sepolia.etherscan.io'}/address/${address}`);

    // Verify the contract on Etherscan
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("🔍 Verifying contract on Etherscan...");
      try {
        await hre.run("verify:verify", {
          address: address,
          constructorArguments: constructorArgs,
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

    return contract;
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