const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FusionBridge to Ethereum Mainnet (Simple Method)...");

  // Get the signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log("📋 Account balance:", await hre.ethers.provider.getBalance(deployer.address));

  // For now, we'll use a placeholder address for the Fusion+ resolver
  const fusionResolverAddress = "0x0000000000000000000000000000000000000000";

  console.log("📋 Deploying with parameters:");
  console.log(`   Fusion+ Resolver: ${fusionResolverAddress}`);

  try {
    // Deploy using the simplest possible method
    console.log("🔧 Deploying contract...");
    const FusionBridge = await hre.ethers.getContractFactory("FusionBridge");
    const fusionBridge = await FusionBridge.deploy(fusionResolverAddress);
    
    console.log("✅ Contract deployment transaction sent!");
    console.log("📋 Contract address:", await fusionBridge.getAddress());
    console.log("⏳ Waiting for deployment to be confirmed...");
    
    await fusionBridge.waitForDeployment();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📋 Final contract address:", await fusionBridge.getAddress());

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("📋 Full error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 