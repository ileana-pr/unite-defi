const { ethers } = require('ethers');

class TokenService {
  constructor() {
    this.network = process.env.NETWORK || 'mainnet';
    
    // Ethereum mainnet token addresses
    this.ethereumTokens = {
      ETH: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        chain: 'ethereum',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
      },
      USDC_ETH: {
        address: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        chain: 'ethereum',
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      },
      USDT: {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether',
        decimals: 6,
        chain: 'ethereum',
        logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
      },
      WETH: {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        name: 'Wrapped Ethereum',
        decimals: 18,
        chain: 'ethereum',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
      }
    };

    // Aptos token addresses
    this.aptosTokens = {
      APT: {
        address: '0x1::aptos_coin::AptosCoin',
        symbol: 'APT',
        name: 'Aptos',
        decimals: 8,
        chain: 'aptos',
        logo: 'https://cryptologos.cc/logos/aptos-apt-logo.png'
      },
      USDC_APT: {
        address: '0x1::coin::T<0x1::aptos_coin::AptosCoin>',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        chain: 'aptos',
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      }
    };

    // Testnet token addresses
    this.testnetTokens = {
      ethereum: {
        ETH: {
          address: '0x0000000000000000000000000000000000000000', // Native ETH
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chain: 'ethereum',
          testnet: true,
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
        },
        USDC_ETH: {
          address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chain: 'ethereum',
          testnet: true,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        },
        WETH: {
          address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // Sepolia WETH
          symbol: 'WETH',
          name: 'Wrapped Ethereum',
          decimals: 18,
          chain: 'ethereum',
          testnet: true,
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
        }
      },
      aptos: {
        APT: {
          address: '0x1::aptos_coin::AptosCoin', // Native APT
          symbol: 'APT',
          name: 'Aptos',
          decimals: 8,
          chain: 'aptos',
          testnet: true,
          logo: 'https://cryptologos.cc/logos/aptos-apt-logo.png'
        },
        USDC_APT: {
          address: '0x1::coin::USDC', // Aptos Testnet USDC
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          chain: 'aptos',
          testnet: true,
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        }
      }
    };
  }

  /**
   * Get token information by symbol and chain
   * @param {string} symbol - Token symbol (e.g., 'ETH', 'APT')
   * @param {string} chain - Chain name ('ethereum' or 'aptos')
   * @returns {Object|null} Token information or null if not found
   */
  getToken(symbol, chain) {
    if (this.network === 'testnet') {
      const testnetTokens = this.testnetTokens[chain];
      return testnetTokens[symbol] || null;
    }
    const tokens = chain === 'ethereum' ? this.ethereumTokens : this.aptosTokens;
    return tokens[symbol] || null;
  }

  /**
   * Get all tokens for a specific chain
   * @param {string} chain - Chain name ('ethereum' or 'aptos')
   * @returns {Array} Array of token objects
   */
  getTokensForChain(chain) {
    if (this.network === 'testnet') {
      const testnetTokens = this.testnetTokens[chain];
      return Object.values(testnetTokens);
    }
    const tokens = chain === 'ethereum' ? this.ethereumTokens : this.aptosTokens;
    return Object.values(tokens);
  }

  /**
   * Get all supported tokens
   * @returns {Array} Array of all token objects
   */
  getAllTokens() {
    if (this.network === 'testnet') {
      return [
        ...Object.values(this.testnetTokens.ethereum),
        ...Object.values(this.testnetTokens.aptos)
      ];
    }
    return [
      ...Object.values(this.ethereumTokens),
      ...Object.values(this.aptosTokens)
    ];
  }

  /**
   * Convert amount to wei (for Ethereum tokens)
   * @param {string} amount - Amount in human readable format
   * @param {number} decimals - Token decimals
   * @returns {string} Amount in wei
   */
  toWei(amount, decimals) {
    try {
      return ethers.parseUnits(amount, decimals).toString();
    } catch (error) {
      throw new Error(`Invalid amount: ${amount}`);
    }
  }

  /**
   * Convert amount from wei to human readable format
   * @param {string} weiAmount - Amount in wei
   * @param {number} decimals - Token decimals
   * @returns {string} Amount in human readable format
   */
  fromWei(weiAmount, decimals) {
    try {
      return ethers.formatUnits(weiAmount, decimals);
    } catch (error) {
      throw new Error(`Invalid wei amount: ${weiAmount}`);
    }
  }

  /**
   * Validate token address format
   * @param {string} address - Token address
   * @param {string} chain - Chain name
   * @returns {boolean} True if valid
   */
  isValidAddress(address, chain) {
    if (chain === 'ethereum') {
      return ethers.isAddress(address);
    } else if (chain === 'aptos') {
      // Aptos addresses have a different format
      return address.includes('::') && address.includes('0x');
    }
    return false;
  }

  /**
   * Get token address by symbol and chain
   * @param {string} symbol - Token symbol
   * @param {string} chain - Chain name
   * @returns {string|null} Token address or null if not found
   */
  getTokenAddress(symbol, chain) {
    const token = this.getToken(symbol, chain);
    return token ? token.address : null;
  }

  /**
   * Get token decimals by symbol and chain
   * @param {string} symbol - Token symbol
   * @param {string} chain - Chain name
   * @returns {number|null} Token decimals or null if not found
   */
  getTokenDecimals(symbol, chain) {
    const token = this.getToken(symbol, chain);
    return token ? token.decimals : null;
  }

  /**
   * Check if token is supported
   * @param {string} symbol - Token symbol
   * @param {string} chain - Chain name
   * @returns {boolean} True if supported
   */
  isTokenSupported(symbol, chain) {
    return this.getToken(symbol, chain) !== null;
  }

  /**
   * Get supported token pairs for cross-chain swaps
   * @returns {Array} Array of supported token pairs
   */
  getSupportedPairs() {
    const pairs = [];
    
    // ETH <-> APT
    pairs.push({
      from: { symbol: 'ETH', chain: 'ethereum' },
      to: { symbol: 'APT', chain: 'aptos' },
      enabled: true
    });

    // USDC <-> USDC (cross-chain)
    pairs.push({
      from: { symbol: 'USDC', chain: 'ethereum' },
      to: { symbol: 'USDC', chain: 'aptos' },
      enabled: true
    });

    return pairs;
  }
}

module.exports = TokenService; 