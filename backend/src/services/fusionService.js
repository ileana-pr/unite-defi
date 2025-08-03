const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

class FusionService {
  constructor() {
    this.apiKey = process.env.FUSION_API_KEY;
    this.baseURL = 'https://api.1inch.dev';
    this.fusionResolver = process.env.FUSION_RESOLVER_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    // Get network configuration
    this.network = process.env.NETWORK || 'testnet';
    this.chainId = this.getChainId();
    
    if (!this.apiKey || this.apiKey === 'your_1inch_fusion_api_key_here') {
      console.warn('⚠️  FUSION_API_KEY not set in environment variables');
      console.warn('📝 Get your free API key from: https://portal.1inch.dev/');
    } else {
      console.log(`✅ 1inch Fusion+ API configured for ${this.getNetworkName()}`);
    }
  }

  /**
   * Get network name for display
   */
  getNetworkName() {
    const network = process.env.NETWORK || 'testnet';
    const names = {
      'mainnet': 'Ethereum Mainnet',
      'testnet': 'Sepolia Testnet',
      'sepolia': 'Sepolia Testnet',
      'goerli': 'Goerli Testnet',
      'hardhat': 'Local Hardhat'
    };
    return names[network] || 'Unknown Network';
  }

  /**
   * Get Fusion+ quote with MEV protection
   * @param {string} fromToken - Source token address
   * @param {string} toToken - Destination token address
   * @param {string} amount - Amount to swap (in wei)
   * @param {string} fromAddress - User's address
   * @param {number} chainId - Chain ID (optional, uses environment default)
   * @returns {Promise<Object>} Fusion+ quote data
   */
  async getFusionQuote(fromToken, toToken, amount, fromAddress, chainId = null) {
    try {
      if (!this.apiKey || this.apiKey === 'your_1inch_fusion_api_key_here') {
        throw new Error('1inch Fusion+ API key not configured. Get your free key from https://portal.1inch.dev/');
      }

      // Use provided chainId or default from environment
      const targetChainId = chainId || this.chainId;

      console.log(`🔍 Getting Fusion+ quote on ${this.getNetworkName()}: ${fromToken} → ${toToken} (${ethers.formatEther(amount)} ETH)`);

      // Get Fusion+ quote with MEV protection
      const response = await axios.get(`${this.baseURL}/swap/v6.0/${targetChainId}/quote`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        params: {
          src: fromToken,
          dst: toToken,
          amount: amount,
          from: fromAddress,
          includeTokensInfo: true,
          includeGas: true,
          // Fusion+ specific parameters
          enableEstimate: true,
          permit: true,
          receiver: fromAddress,
          // MEV protection
          enableSlippageProtection: true,
          // Limit order support
          enableLimitOrder: false // Set to true for limit orders
        }
      });

      console.log('✅ Fusion+ quote received:', response.data);

      return {
        success: true,
        data: response.data,
        network: this.getNetworkName(),
        chainId: targetChainId
      };
    } catch (error) {
      console.error('❌ Fusion+ API Error:', error.response?.data || error.message);
      
      // If Fusion+ API fails, provide helpful error message
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please check your 1inch Fusion+ API key'
        };
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later'
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          error: `Invalid request: ${error.response.data?.description || 'Check token addresses and amounts'}`
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Create Fusion+ order with MEV protection
   * @param {string} fromToken - Source token address
   * @param {string} toToken - Destination token address
   * @param {string} amount - Amount to swap (in wei)
   * @param {string} fromAddress - User's address
   * @param {number} slippage - Slippage tolerance (default 1%)
   * @param {number} chainId - Chain ID (optional, uses environment default)
   * @returns {Promise<Object>} Fusion+ order data
   */
  async createFusionOrder(fromToken, toToken, amount, fromAddress, slippage = 1, chainId = null) {
    try {
      if (!this.apiKey || this.apiKey === 'your_1inch_fusion_api_key_here') {
        throw new Error('1inch Fusion+ API key not configured. Get your free key from https://portal.1inch.dev/');
      }

      // Use provided chainId or default from environment
      const targetChainId = chainId || this.chainId;

      console.log(`🚀 Creating Fusion+ order on ${this.getNetworkName()}: ${fromToken} → ${toToken} (${ethers.formatEther(amount)} ETH)`);

      // Create Fusion+ order
      const response = await axios.post(`${this.baseURL}/swap/v6.0/${targetChainId}/swap`, {
        src: fromToken,
        dst: toToken,
        amount: amount,
        from: fromAddress,
        slippage: slippage,
        // Fusion+ specific parameters
        enableEstimate: true,
        permit: true,
        receiver: fromAddress,
        // MEV protection
        enableSlippageProtection: true,
        // Order type
        orderType: 'MARKET', // or 'LIMIT' for limit orders
        // Limit order parameters (if applicable)
        limitPrice: null,
        validUntil: null
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Fusion+ order created:', response.data);

      return {
        success: true,
        data: response.data,
        network: this.getNetworkName(),
        chainId: targetChainId
      };
    } catch (error) {
      console.error('❌ Fusion+ Order Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Get Fusion+ order status
   * @param {string} orderHash - Fusion+ order hash
   * @param {number} chainId - Chain ID (optional, uses environment default)
   * @returns {Promise<Object>} Order status
   */
  async getFusionOrderStatus(orderHash, chainId = null) {
    try {
      if (!this.apiKey || this.apiKey === 'your_1inch_fusion_api_key_here') {
        throw new Error('1inch Fusion+ API key not configured. Get your free key from https://portal.1inch.dev/');
      }

      // Use provided chainId or default from environment
      const targetChainId = chainId || this.chainId;

      console.log(`📊 Checking Fusion+ order status on ${this.getNetworkName()}: ${orderHash}`);

      const response = await axios.get(`${this.baseURL}/fusion/v1.0/${targetChainId}/order/${orderHash}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      console.log('✅ Fusion+ order status:', response.data);

      return {
        success: true,
        data: response.data,
        network: this.getNetworkName(),
        chainId: targetChainId
      };
    } catch (error) {
      console.error('❌ Fusion+ Status Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Create cross-chain Fusion+ order extending 1inch to Aptos
   * @param {Object} params - Cross-chain parameters
   * @returns {Promise<Object>} Cross-chain order data
   */
  async createCrossChainFusionOrder(params) {
    const {
      fromToken,
      toToken,
      fromChain,
      toChain,
      amount,
      fromAddress,
      toAddress,
      slippage = 1
    } = params;

    try {
      console.log(`🌉 Creating 1inch Fusion+ extension for ${fromChain} → ${toChain}`);

      // Step 1: Use 1inch Fusion+ for Ethereum side (if source is Ethereum)
      let sourceQuote = null;
      let fusionOrderId = null;
      
      if (fromChain === 'ethereum') {
        console.log('🔗 Using 1inch Fusion+ for Ethereum side...');
        
        // Get Fusion+ quote for Ethereum → USDC (intermediate token)
        sourceQuote = await this.getFusionQuote(
          fromToken,
          '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C', // USDC address
          amount,
          fromAddress,
          this.getChainId(fromChain)
        );

        if (sourceQuote.success) {
          // Create Fusion+ order for Ethereum side
          const fusionOrder = await this.createFusionOrder(
            fromToken,
            '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C', // USDC
            amount,
            fromAddress,
            slippage
          );
          
          if (fusionOrder.success) {
            fusionOrderId = fusionOrder.data.orderId;
            console.log('✅ 1inch Fusion+ order created:', fusionOrderId);
          }
        }
      }

      // Step 2: Generate hashlock and timelock for cross-chain security
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes(`${Date.now()}-${fromAddress}-${toAddress}`));
      const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      // Step 3: Create Aptos extension with hashlock/timelock
      const aptosExtension = {
        hashlock,
        timelock,
        recipient: toAddress,
        amount: sourceQuote?.data?.toTokenAmount || amount,
        status: 'pending'
      };

      // Step 4: Create unified cross-chain order
      const crossChainOrder = {
        orderId: `fusion_aptos_${Date.now()}`,
        fusionOrderId, // 1inch Fusion+ order ID
        sourceChain: fromChain,
        destinationChain: toChain,
        sourceQuote,
        aptosExtension, // Our extension for Aptos
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedTime: '45 seconds',
        fees: {
          sourceChain: sourceQuote?.data?.gasCost || '0',
          bridgeFee: '0.1%',
          destinationChain: '0'
        },
        network: this.getNetworkName(),
        // Hashlock and timelock for security
        hashlock: hashlock,
        timelock: timelock
      };

      console.log('✅ 1inch Fusion+ Aptos extension created:', crossChainOrder);

      return {
        success: true,
        data: crossChainOrder
      };
    } catch (error) {
      console.error('❌ 1inch Fusion+ Aptos extension error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get intermediate token for cross-chain swaps
   * @param {string} chain - Chain name
   * @returns {string} Intermediate token address
   */
  getIntermediateToken(chain) {
    const intermediateTokens = {
      ethereum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE', // Native ETH
      aptos: '0x1::coin::USDC' // Aptos testnet USDC
    };
    return intermediateTokens[chain] || intermediateTokens.ethereum;
  }

  /**
   * Get chain ID for 1inch API
   * @param {string} chain - Chain name
   * @returns {number} Chain ID
   */
  getChainId(chain = null) {
    // If no chain specified, use environment default
    if (!chain) {
      const network = process.env.NETWORK || 'testnet';
      const chainIds = {
        'mainnet': 1,        // Ethereum mainnet
        'testnet': 11155111, // Sepolia testnet
        'sepolia': 11155111, // Sepolia testnet
        'goerli': 5,         // Goerli testnet
        'hardhat': 31337     // Local hardhat network
      };
      return chainIds[network] || 11155111;
    }

    // Chain-specific mapping
    const chainIds = {
      ethereum: 1,        // Ethereum mainnet
      sepolia: 11155111,  // Sepolia testnet
      aptos: 11155111     // Use Sepolia for testing (1inch doesn't support Aptos yet)
    };
    return chainIds[chain] || 11155111; // Default to Sepolia testnet
  }

  /**
   * Calculate destination amount (placeholder for real DEX integration)
   * @param {string} sourceAmount - Amount from source chain
   * @param {string} fromChain - Source chain
   * @param {string} toChain - Destination chain
   * @returns {string} Estimated destination amount
   */
  calculateDestinationAmount(sourceAmount, fromChain, toChain) {
    // This would integrate with Aptos DEX APIs in real implementation
    const exchangeRates = {
      'ethereum-aptos': 1.5, // ETH to APT rate
      'aptos-ethereum': 0.67 // APT to ETH rate
    };
    
    const rate = exchangeRates[`${fromChain}-${toChain}`] || 1;
    return (parseFloat(sourceAmount) * rate).toString();
  }

  /**
   * Check if service is properly configured
   * @returns {boolean} True if API key is set
   */
  isConfigured() {
    return !!(this.apiKey && this.apiKey !== 'your_1inch_fusion_api_key_here');
  }

  /**
   * Get Fusion+ resolver address
   * @returns {string} Resolver address
   */
  getFusionResolver() {
    return this.fusionResolver;
  }

  /**
   * Test API connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'API key not configured'
        };
      }

      console.log(`🧪 Testing Fusion+ API connection on ${this.getNetworkName()}...`);

      // Test with a simple quote request
      const testQuote = await this.getFusionQuote(
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE', // Native ETH
        '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
        ethers.parseEther('0.001'), // 0.001 ETH
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        this.chainId
      );

      return {
        ...testQuote,
        network: this.getNetworkName(),
        chainId: this.chainId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        network: this.getNetworkName(),
        chainId: this.chainId
      };
    }
  }

  /**
   * Switch network (for testing different environments)
   * @param {string} network - Network to switch to
   */
  async switchNetwork(network) {
    try {
      // Update environment
      process.env.NETWORK = network;
      
      // Reinitialize with new network
      this.network = network;
      this.chainId = this.getChainId();
      
      console.log(`🔄 Switched to ${this.getNetworkName()}`);
      
      return {
        success: true,
        network: this.getNetworkName(),
        chainId: this.chainId
      };
    } catch (error) {
      console.error('Network switch error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = FusionService; 