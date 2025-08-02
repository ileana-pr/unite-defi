const axios = require('axios');
require('dotenv').config();

class OneInchService {
  constructor() {
    this.apiKey = process.env.FUSION_API_KEY;
    this.baseURL = 'https://api.1inch.dev';
    
    if (!this.apiKey) {
      console.warn('⚠️  FUSION_API_KEY not set in environment variables');
    }
  }

  /**
   * Get a quote for swapping tokens
   * @param {string} fromToken - Source token address
   * @param {string} toToken - Destination token address  
   * @param {string} amount - Amount to swap (in wei)
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet)
   * @returns {Promise<Object>} Quote data
   */
  async getQuote(fromToken, toToken, amount, chainId = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('1inch API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/swap/v6.0/${chainId}/quote`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        params: {
          src: fromToken,
          dst: toToken,
          amount: amount,
          includeTokensInfo: true,
          includeGas: true
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('1inch API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Get swap transaction data
   * @param {string} fromToken - Source token address
   * @param {string} toToken - Destination token address
   * @param {string} amount - Amount to swap (in wei)
   * @param {string} fromAddress - User's address
   * @param {number} slippage - Slippage tolerance (default 1%)
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet)
   * @returns {Promise<Object>} Swap transaction data
   */
  async getSwapData(fromToken, toToken, amount, fromAddress, slippage = 1, chainId = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('1inch API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/swap/v6.0/${chainId}/swap`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        params: {
          src: fromToken,
          dst: toToken,
          amount: amount,
          from: fromAddress,
          slippage: slippage,
          includeTokensInfo: true,
          includeGas: true
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('1inch Swap Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Get token list for a chain
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet)
   * @returns {Promise<Object>} Token list
   */
  async getTokens(chainId = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('1inch API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/swap/v6.0/${chainId}/tokens`, {
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
      console.error('1inch Tokens Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Get token prices
   * @param {Array<string>} tokens - Array of token addresses
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet)
   * @returns {Promise<Object>} Token prices
   */
  async getPrices(tokens, chainId = 1) {
    try {
      if (!this.apiKey) {
        throw new Error('1inch API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/swap/v6.0/${chainId}/prices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        params: {
          tokens: tokens.join(',')
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('1inch Prices Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.description || error.message
      };
    }
  }

  /**
   * Check if service is properly configured
   * @returns {boolean} True if API key is set
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = OneInchService; 