const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying FusionBridge to Ethereum Mainnet (Raw Method)...");

  // Get the signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  console.log("📋 Account balance:", await hre.ethers.provider.getBalance(deployer.address));

  // For now, we'll use a placeholder address for the Fusion+ resolver
  const fusionResolverAddress = "0x0000000000000000000000000000000000000000";

  console.log("📋 Deploying with parameters:");
  console.log(`   Fusion+ Resolver: ${fusionResolverAddress}`);

  try {
    // Get the contract bytecode and ABI from the artifacts
    const contractPath = path.join(__dirname, "../artifacts/contracts/FusionBridge.sol/FusionBridge.json");
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    
    console.log("🔧 Contract artifact loaded successfully");
    console.log(`   Bytecode length: ${contractArtifact.bytecode.length} characters`);

    // Get current gas price
    console.log("🔧 Getting current gas price...");
    const feeData = await hre.ethers.provider.getFeeData();
    console.log("📊 Current gas price:", hre.ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");

    // Create the deployment transaction manually
    const deploymentData = contractArtifact.bytecode + 
      hre.ethers.zeroPadValue(fusionResolverAddress, 32).slice(2); // Remove '0x' prefix

    console.log("🔧 Creating deployment transaction...");
    
    // Get the current nonce
    const nonce = await hre.ethers.provider.getTransactionCount(deployer.address);
    console.log("📊 Current nonce:", nonce);

    // Estimate gas for deployment
    const gasEstimate = await hre.ethers.provider.estimateGas({
      from: deployer.address,
      data: deploymentData
    });
    console.log("📊 Estimated gas:", gasEstimate.toString());

    // Create the transaction
    const tx = {
      from: deployer.address,
      data: deploymentData,
      gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      nonce: nonce,
      type: 2 // EIP-1559 transaction
    };

    console.log("🔧 Transaction created:");
    console.log(`   From: ${tx.from}`);
    console.log(`   Gas Limit: ${tx.gasLimit.toString()}`);
    console.log(`   Max Fee Per Gas: ${hre.ethers.formatUnits(tx.maxFeePerGas || 0, "gwei")} gwei`);
    console.log(`   Max Priority Fee Per Gas: ${hre.ethers.formatUnits(tx.maxPriorityFeePerGas || 0, "gwei")} gwei`);
    console.log(`   Nonce: ${tx.nonce}`);

    // Sign and send the transaction
    console.log("🔧 Signing and sending transaction...");
    const signedTx = await deployer.signTransaction(tx);
    const txResponse = await hre.ethers.provider.broadcastTransaction(signedTx);
    
    console.log("✅ Transaction sent!");
    console.log("📋 Transaction hash:", txResponse.hash);
    console.log("⏳ Waiting for confirmation...");

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📋 Contract address:", receipt.contractAddress);
    console.log("📋 Gas used:", receipt.gasUsed.toString());
    console.log("📋 Block number:", receipt.blockNumber);

    // Save the deployment info
    const deploymentInfo = {
      network: "mainnet",
      contractAddress: receipt.contractAddress,
      transactionHash: receipt.hash,
      deployer: deployer.address,
      fusionResolverAddress: fusionResolverAddress,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(__dirname, "../deployment-mainnet.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📁 Deployment info saved to deployment-mainnet.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.transaction) {
      console.error("📋 Failed transaction:", error.transaction);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 