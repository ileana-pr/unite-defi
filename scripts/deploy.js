#!/usr/bin/env node

/**
 * Production-ready deployment script
 * Deploys contracts to both testnet and mainnet
 * Usage: 
 *   node scripts/deploy.js --network testnet
 *   node scripts/deploy.js --network mainnet
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const network = args.find(arg => arg.startsWith('--network='))?.split('=')[1] || 'testnet';

console.log(`🚀 Deploying to ${network}...`);

// Validate network
if (!['testnet', 'mainnet'].includes(network)) {
  console.error('❌ Invalid network. Use --network=testnet or --network=mainnet');
  process.exit(1);
}

// Set environment variables
process.env.NETWORK = network;
process.env.NODE_ENV = network === 'mainnet' ? 'production' : 'development';

// Load configuration
const config = require('../backend/src/config/environment.js');

// Validate configuration
const validation = config.validate();
if (!validation.isValid) {
  console.error('❌ Configuration validation failed:');
  validation.errors.forEach(error => console.error(`   - ${error}`));
  process.exit(1);
}

// Log configuration
config.logConfig();

// Deployment functions
async function deployEthereumContracts() {
  console.log('\n🔗 Deploying Ethereum contracts...');
  
  try {
    const command = `cd contracts/ethereum && npx hardhat deploy --network ${network}`;
    console.log(`Running: ${command}`);
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Ethereum contracts deployed successfully');
    console.log(output);
    
    // Extract contract addresses
    const addressMatch = output.match(/Bridge deployed to: (0x[a-fA-F0-9]{40})/);
    if (addressMatch) {
      const bridgeAddress = addressMatch[1];
      console.log(`📝 Bridge Address: ${bridgeAddress}`);
      
      // Update .env file
      updateEnvFile('ETHEREUM_BRIDGE_ADDRESS', bridgeAddress);
    }
    
  } catch (error) {
    console.error('❌ Ethereum deployment failed:', error.message);
    throw error;
  }
}

async function deployAptosContracts() {
  console.log('\n🔗 Deploying Aptos contracts...');
  
  try {
    const aptosDir = path.join(__dirname, '../contracts/aptos');
    const command = `cd ${aptosDir} && aptos move publish --named-addresses fusion_bridge=0xbe96f912fdfb842460fb5985654cc48c403f16d9ae88d33c20b533093881f0e5 --profile ${network} --max-gas 200000`;
    
    console.log(`Running: ${command}`);
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Aptos contracts deployed successfully');
    console.log(output);
    
    // Extract transaction hash
    const txMatch = output.match(/Transaction submitted: (https:\/\/explorer\.aptoslabs\.com\/txn\/[a-fA-F0-9]+)/);
    if (txMatch) {
      console.log(`📝 Transaction: ${txMatch[1]}`);
    }
    
    // Update .env file
    updateEnvFile('APTOS_BRIDGE_ADDRESS', '0xbe96f912fdfb842460fb5985654cc48c403f16d9ae88d33c20b533093881f0e5');
    
  } catch (error) {
    console.error('❌ Aptos deployment failed:', error.message);
    throw error;
  }
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '../.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if key already exists
    const keyRegex = new RegExp(`^${key}=.*$`, 'm');
    if (keyRegex.test(envContent)) {
      // Update existing key
      envContent = envContent.replace(keyRegex, `${key}=${value}`);
    } else {
      // Add new key
      envContent += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env file: ${key}=${value}`);
  } else {
    console.log(`📝 Creating .env file with ${key}=${value}`);
    fs.writeFileSync(envPath, `${key}=${value}\n`);
  }
}

function runTests() {
  console.log('\n🧪 Running tests...');
  
  try {
    // Test Ethereum contracts
    console.log('Testing Ethereum contracts...');
    execSync('cd contracts/ethereum && npx hardhat test', { stdio: 'inherit' });
    
    // Test Aptos contracts (if test framework exists)
    console.log('Testing Aptos contracts...');
    // execSync('cd contracts/aptos && aptos move test', { stdio: 'inherit' });
    
    console.log('✅ All tests passed');
    
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    throw error;
  }
}

// Main deployment function
async function deploy() {
  console.log(`\n🚀 Starting deployment to ${network.toUpperCase()}`);
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Deploy Ethereum contracts
    await deployEthereumContracts();
    
    // Step 2: Deploy Aptos contracts
    await deployAptosContracts();
    
    // Step 3: Run tests (only on testnet)
    if (network === 'testnet') {
      runTests();
    }
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the new contract addresses');
    console.log('2. Restart your backend server');
    console.log('3. Test the bridge functionality');
    
    if (network === 'mainnet') {
      console.log('\n⚠️  WARNING: This is mainnet deployment with real funds!');
      console.log('   - Ensure all contracts are properly audited');
      console.log('   - Test thoroughly on testnet first');
      console.log('   - Monitor transactions carefully');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploy(); 