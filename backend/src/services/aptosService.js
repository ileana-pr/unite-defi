const { AptosClient, AptosAccount, TxnBuilderTypes, BCS } = require('aptos');
require('dotenv').config();

class AptosService {
  constructor() {
    // Get network configuration
    this.network = process.env.NETWORK || 'testnet';
    this.nodeUrl = this.getNodeUrl();
    
    // Initialize Aptos client
    this.client = new AptosClient(this.nodeUrl);
    
    // Initialize wallet if private key is provided
    this.privateKey = process.env.APTOS_PRIVATE_KEY;
    if (this.privateKey && this.privateKey !== 'your_aptos_private_key_here') {
      this.account = new AptosAccount(Buffer.from(this.privateKey, 'hex'));
      console.log(`✅ Aptos wallet configured for ${this.getNetworkName()}:`, this.account.address().toString());
    } else {
      console.warn('⚠️  APTOS_PRIVATE_KEY not set in environment variables');
    }
    
    // Contract addresses (these would be deployed addresses)
    this.contractAddresses = {
      fusionBridge: process.env.APTOS_BRIDGE_ADDRESS || '0x0000000000000000000000000000000000000000000000000000000000000001'
    };
  }

  /**
   * Get Aptos node URL based on environment
   */
  getNodeUrl() {
    const network = process.env.NETWORK || 'testnet';
    
    if (network === 'mainnet') {
      return process.env.APTOS_NODE_URL || 'https://fullnode.mainnet.aptoslabs.com/v1';
    } else if (network === 'testnet' || network === 'sepolia') {
      return process.env.APTOS_TESTNET_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    } else {
      return process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    }
  }

  /**
   * Get network name for display
   */
  getNetworkName() {
    const network = process.env.NETWORK || 'testnet';
    const names = {
      'mainnet': 'Aptos Mainnet',
      'testnet': 'Aptos Testnet',
      'sepolia': 'Aptos Testnet',
      'goerli': 'Aptos Testnet',
      'hardhat': 'Aptos Testnet'
    };
    return names[network] || 'Aptos Testnet';
  }

  /**
   * Get chain ID for Aptos
   */
  getChainId() {
    const network = process.env.NETWORK || 'testnet';
    const chainIds = {
      'mainnet': 1,        // Aptos mainnet
      'testnet': 2,        // Aptos testnet
      'sepolia': 2,        // Aptos testnet
      'goerli': 2,         // Aptos testnet
      'hardhat': 2         // Aptos testnet
    };
    return chainIds[network] || 2;
  }

  /**
   * Initiate a cross-chain swap on Aptos
   * @param {Object} params - Swap parameters
   * @returns {Promise<Object>} Transaction result
   */
  async initiateSwap(params) {
    const {
      recipient,
      amount,
      hashlock,
      timelock,
      targetChain
    } = params;

    try {
      if (!this.account) {
        throw new Error('Aptos wallet not configured. Please set APTOS_PRIVATE_KEY in .env file');
      }

      // Check if we have a deployed contract address
      if (this.contractAddresses.fusionBridge === '0x0000000000000000000000000000000000000000000000000000000000000001') {
        throw new Error(`FusionBridge contract not deployed on ${this.getNetworkName()}. Please deploy contracts first and set APTOS_BRIDGE_ADDRESS`);
      }

      console.log(`🚀 Initiating swap on ${this.getNetworkName()}...`);

      // Create transaction payload for initiate_swap function
      const payload = {
        function: `${this.contractAddresses.fusionBridge}::fusion_bridge::initiate_swap`,
        type_arguments: [],
        arguments: [
          recipient,
          amount.toString(),
          hashlock,
          timelock.toString(),
          targetChain
        ]
      };

      // Submit transaction
      const transaction = await this.client.generateTransaction(
        this.account.address(),
        payload
      );

      // Sign and submit transaction
      const signedTxn = await this.client.signTransaction(this.account, transaction);
      const result = await this.client.submitTransaction(signedTxn);
      
      // Wait for transaction
      await this.client.waitForTransaction(result.hash);

      console.log('✅ Aptos transaction confirmed:', result.hash);

      return {
        success: true,
        transaction: {
          hash: result.hash,
          from: this.account.address().toString(),
          to: this.contractAddresses.fusionBridge,
          value: amount,
          status: 'success',
          network: this.getNetworkName()
        },
        message: `Swap initiated successfully on ${this.getNetworkName()}`
      };
    } catch (error) {
      console.error('Aptos contract interaction error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete a swap on Aptos
   * @param {string} hashlock - The hashlock of the swap
   * @returns {Promise<Object>} Transaction result
   */
  async completeSwap(hashlock) {
    try {
      if (!this.account) {
        throw new Error('Aptos wallet not configured');
      }

      if (this.contractAddresses.fusionBridge === '0x0000000000000000000000000000000000000000000000000000000000000001') {
        throw new Error(`FusionBridge contract not deployed on ${this.getNetworkName()}`);
      }

      const payload = {
        function: `${this.contractAddresses.fusionBridge}::fusion_bridge::complete_swap`,
        type_arguments: [],
        arguments: [hashlock]
      };

      const transaction = await this.client.generateTransaction(
        this.account.address(),
        payload
      );

      const signedTxn = await this.client.signTransaction(this.account, transaction);
      const result = await this.client.submitTransaction(signedTxn);
      
      await this.client.waitForTransaction(result.hash);

      return {
        success: true,
        transaction: {
          hash: result.hash,
          status: 'success',
          network: this.getNetworkName()
        },
        message: `Swap completed successfully on ${this.getNetworkName()}`
      };
    } catch (error) {
      console.error('Complete swap error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refund a swap on Aptos
   * @param {string} hashlock - The hashlock of the swap
   * @returns {Promise<Object>} Transaction result
   */
  async refundSwap(hashlock) {
    try {
      if (!this.account) {
        throw new Error('Aptos wallet not configured');
      }

      if (this.contractAddresses.fusionBridge === '0x0000000000000000000000000000000000000000000000000000000000000001') {
        throw new Error(`FusionBridge contract not deployed on ${this.getNetworkName()}`);
      }

      const payload = {
        function: `${this.contractAddresses.fusionBridge}::fusion_bridge::refund_swap`,
        type_arguments: [],
        arguments: [hashlock]
      };

      const transaction = await this.client.generateTransaction(
        this.account.address(),
        payload
      );

      const signedTxn = await this.client.signTransaction(this.account, transaction);
      const result = await this.client.submitTransaction(signedTxn);
      
      await this.client.waitForTransaction(result.hash);

      return {
        success: true,
        transaction: {
          hash: result.hash,
          status: 'success',
          network: this.getNetworkName()
        },
        message: `Swap refunded successfully on ${this.getNetworkName()}`
      };
    } catch (error) {
      console.error('Refund swap error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get swap request details from contract
   * @param {string} hashlock - The hashlock to query
   * @returns {Promise<Object>} Swap request details
   */
  async getSwapRequest(hashlock) {
    try {
      if (this.contractAddresses.fusionBridge === '0x0000000000000000000000000000000000000000000000000000000000000001') {
        throw new Error(`Contract not deployed on ${this.getNetworkName()}. Please deploy FusionBridge contract first`);
      }

      // This would call the get_swap_request function on the contract
      // For now, return error indicating contract needs to be deployed
      throw new Error(`Contract not deployed on ${this.getNetworkName()}. Please deploy FusionBridge contract first`);
    } catch (error) {
      console.error('Get swap request error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if service is properly configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    return !!(this.client && this.privateKey && this.privateKey !== 'your_aptos_private_key_here');
  }

  /**
   * Get wallet address
   * @returns {string} Wallet address
   */
  getWalletAddress() {
    return this.account ? this.account.address().toString() : null;
  }

  /**
   * Get network info
   * @returns {Promise<Object>} Network information
   */
  async getNetworkInfo() {
    try {
      const ledgerInfo = await this.client.getLedgerInfo();
      
      return {
        chainId: this.getChainId(),
        name: this.getNetworkName(),
        blockHeight: ledgerInfo.ledger_version,
        nodeUrl: this.nodeUrl,
        environment: this.network
      };
    } catch (error) {
      console.error('Network info error:', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * Test connection to Aptos network
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      console.log(`🧪 Testing Aptos connection on ${this.getNetworkName()}...`);

      const ledgerInfo = await this.client.getLedgerInfo();
      const accountInfo = this.account ? await this.client.getAccount(this.account.address()) : null;

      return {
        success: true,
        network: this.getNetworkName(),
        chainId: this.getChainId(),
        ledgerVersion: ledgerInfo.ledger_version,
        accountInfo: accountInfo ? {
          address: accountInfo.address,
          sequenceNumber: accountInfo.sequence_number
        } : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        network: this.getNetworkName(),
        chainId: this.getChainId()
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
      this.nodeUrl = this.getNodeUrl();
      
      this.client = new AptosClient(this.nodeUrl);
      
      if (this.privateKey) {
        this.account = new AptosAccount(Buffer.from(this.privateKey, 'hex'));
      }
      
      console.log(`🔄 Switched to ${this.getNetworkName()}`);
      
      return {
        success: true,
        network: this.getNetworkName(),
        chainId: this.getChainId()
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

module.exports = AptosService; 