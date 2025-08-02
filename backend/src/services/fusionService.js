const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

class FusionService {
  constructor() {
    this.apiKey = process.env.FUSION_API_KEY;
    this.baseURL = 'https://api.1inch.dev';
    this.fusionResolver = process.env.FUSION_RESOLVER_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    if (!this.apiKey) {
      console.warn('⚠️  FUSION_API_KEY not set in environment variables');
    }
  }

  /**
   * Get Fusion+ quote with MEV protection
   * @param {string} fromToken - Source token address
   * @param {string} toToken - Destination token address
   * @param {string} amount - Amount to swap (in wei)
   * @param {string} fromAddress - User's address
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet)
   * @returns {Promise<Object>} Fusion+ quote data
   */
  async getFusionQuote(fromToken, toToken, amount, fromAddress, chainId = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('1inch Fusion+ API key not configured');
      }

      // Get Fusion+ quote with MEV protection
      const response = await axios.get(`${this.baseURL}/fusion/v1.0/${chainId}/quote`, {
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

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Fusion+ API Error:', error.response?.data || error.message);
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
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet)
   * @returns {Promise<Object>} Fusion+ order data
   */
  async createFusionOrder(fromToken, toToken, amount, fromAddress, slippage = 1, chainId = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('1inch Fusion+ API key not configured');
      }

      // Create Fusion+ order
      const response = await axios.post(`${this.baseURL}/fusion/v1.0/${chainId}/order`, {
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

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Fusion+ Order Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Get Fusion+ order status
   * @param {string} orderHash - Fusion+ order hash
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet)
   * @returns {Promise<Object>} Order status
   */
  async getFusionOrderStatus(orderHash, chainId = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('1inch Fusion+ API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/fusion/v1.0/${chainId}/order/${orderHash}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Fusion+ Status Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Create cross-chain Fusion+ order
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
      // Step 1: Get Fusion+ quote for source chain
      const sourceQuote = await this.getFusionQuote(
        fromToken,
        this.getIntermediateToken(fromChain), // Use USDC as intermediate
        amount,
        fromAddress,
        this.getChainId(fromChain)
      );

      if (!sourceQuote.success) {
        return sourceQuote;
      }

      // Step 2: Calculate destination amount (this would come from destination DEX)
      const destinationAmount = this.calculateDestinationAmount(
        sourceQuote.data.toTokenAmount,
        fromChain,
        toChain
      );

      // Step 3: Create cross-chain order structure
      const crossChainOrder = {
        orderId: `fusion_${Date.now()}`,
        sourceChain: fromChain,
        destinationChain: toChain,
        sourceOrder: {
          fromToken,
          toToken: this.getIntermediateToken(fromChain),
          amount,
          fromAddress,
          quote: sourceQuote.data
        },
        destinationOrder: {
          fromToken: this.getIntermediateToken(toChain),
          toToken,
          amount: destinationAmount,
          toAddress,
          estimatedAmount: destinationAmount
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedTime: '45 seconds',
        fees: {
          sourceChain: sourceQuote.data.gasCost || '0',
          bridgeFee: '0.1%',
          destinationChain: '0'
        }
      };

      return {
        success: true,
        data: crossChainOrder
      };
    } catch (error) {
      console.error('Cross-chain Fusion+ Error:', error);
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
      ethereum: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', // USDC
      aptos: '0x1::coin::T<0x1::aptos_coin::AptosCoin>' // USDC on Aptos
    };
    return intermediateTokens[chain] || intermediateTokens.ethereum;
  }

  /**
   * Get chain ID for 1inch API
   * @param {string} chain - Chain name
   * @returns {number} Chain ID
   */
  getChainId(chain) {
    const chainIds = {
      ethereum: 1,
      aptos: 1 // 1inch doesn't support Aptos yet, so we'll use Ethereum
    };
    return chainIds[chain] || 1;
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
    return !!this.apiKey;
  }

  /**
   * Get Fusion+ resolver address
   * @returns {string} Resolver address
   */
  getFusionResolver() {
    return this.fusionResolver;
  }
}

module.exports = FusionService; 