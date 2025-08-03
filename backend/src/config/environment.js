// Production-ready environment configuration
// Supports both testnet and mainnet with easy switching

const ENVIRONMENT = process.env.NODE_ENV || 'development';
const NETWORK = process.env.NETWORK || 'testnet';

const config = {
  // Environment settings
  environment: ENVIRONMENT,
  network: NETWORK,
  isProduction: ENVIRONMENT === 'production',
  isTestnet: NETWORK === 'testnet' || NETWORK === 'sepolia' || NETWORK === 'goerli',
  isMainnet: NETWORK === 'mainnet',

  // Network configurations
  networks: {
    testnet: {
      ethereum: {
        chainId: 11155111, // Sepolia
        rpcUrl: process.env.SEPOLIA_RPC_URL,
        name: 'Sepolia Testnet',
        explorer: 'https://sepolia.etherscan.io'
      },
      aptos: {
        nodeUrl: process.env.APTOS_TESTNET_URL || 'https://fullnode.testnet.aptoslabs.com',
        name: 'Aptos Testnet',
        explorer: 'https://explorer.aptoslabs.com?network=testnet'
      }
    },
    mainnet: {
      ethereum: {
        chainId: 1, // Ethereum mainnet
        rpcUrl: process.env.ETHEREUM_RPC_URL,
        name: 'Ethereum Mainnet',
        explorer: 'https://etherscan.io'
      },
      aptos: {
        nodeUrl: process.env.APTOS_MAINNET_URL || 'https://fullnode.mainnet.aptoslabs.com',
        name: 'Aptos Mainnet',
        explorer: 'https://explorer.aptoslabs.com?network=mainnet'
      }
    }
  },

  // API configurations
  apis: {
    fusion: {
      apiKey: process.env.FUSION_API_KEY,
      baseUrl: 'https://api.1inch.dev',
      // Same API endpoints for both testnet and mainnet
      endpoints: {
        quote: '/swap/v6.0',
        order: '/swap/v6.0',
        status: '/swap/v6.0'
      }
    }
  },

  // Contract addresses (will be different for testnet vs mainnet)
  contracts: {
    ethereum: {
      bridge: process.env.ETHEREUM_BRIDGE_ADDRESS,
      fusionResolver: process.env.FUSION_RESOLVER_ADDRESS
    },
    aptos: {
      bridge: process.env.APTOS_BRIDGE_ADDRESS
    }
  },

  // Security settings
  security: {
    // Same security mechanisms for both testnet and mainnet
    hashlockTimeout: 3600, // 1 hour
    maxSlippage: 5, // 5%
    minAmount: '0.001', // Minimum swap amount
    maxAmount: '100' // Maximum swap amount
  },

  // Get current network config
  getCurrentNetwork() {
    return this.networks[this.isMainnet ? 'mainnet' : 'testnet'];
  },

  // Get network-specific settings
  getEthereumConfig() {
    return this.getCurrentNetwork().ethereum;
  },

  getAptosConfig() {
    return this.getCurrentNetwork().aptos;
  },

  // Validation
  validate() {
    const errors = [];
    
    if (!this.apis.fusion.apiKey) {
      errors.push('FUSION_API_KEY is required');
    }
    
    if (!this.getEthereumConfig().rpcUrl) {
      errors.push(`${this.isMainnet ? 'ETHEREUM_RPC_URL' : 'SEPOLIA_RPC_URL'} is required`);
    }
    
    if (!this.contracts.ethereum.bridge) {
      errors.push(`${this.isMainnet ? 'ETHEREUM_BRIDGE_ADDRESS' : 'ETHEREUM_BRIDGE_ADDRESS'} is required`);
    }
    
    if (!this.contracts.aptos.bridge) {
      errors.push('APTOS_BRIDGE_ADDRESS is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Log configuration (safe for production)
  logConfig() {
    console.log(`🌍 Environment: ${this.environment}`);
    console.log(`🌐 Network: ${this.network}`);
    console.log(`🔗 Ethereum: ${this.getEthereumConfig().name} (Chain ID: ${this.getEthereumConfig().chainId})`);
    console.log(`🔗 Aptos: ${this.getAptosConfig().name}`);
    console.log(`🔧 Production Mode: ${this.isProduction}`);
    console.log(`🧪 Testnet Mode: ${this.isTestnet}`);
  }
};

module.exports = config; 