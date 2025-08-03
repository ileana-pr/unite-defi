const { ethers } = require('ethers');
require('dotenv').config();

class ContractService {
  constructor() {
    // Use environment-based configuration
    this.network = process.env.NETWORK || 'testnet';
    this.chainId = this.getChainId();
    this.rpcUrl = this.getRpcUrl();
    
    this.ethereumProvider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.privateKey = process.env.PRIVATE_KEY;
    
    if (this.privateKey && this.privateKey !== 'your_ethereum_private_key_here') {
      this.ethereumWallet = new ethers.Wallet(this.privateKey, this.ethereumProvider);
      console.log(`✅ Ethereum wallet configured for ${this.network}:`, this.ethereumWallet.address);
    } else {
      console.warn('⚠️  PRIVATE_KEY not set in environment variables');
    }
    
    // Contract addresses based on network
    this.contractAddresses = {
      ethereum: {
        fusionBridge: process.env.ETHEREUM_BRIDGE_ADDRESS || '0x0000000000000000000000000000000000000000',
        fusionResolver: process.env.FUSION_RESOLVER_ADDRESS || '0x0000000000000000000000000000000000000000'
      }
    };
  }

  /**
   * Get chain ID based on environment
   */
  getChainId() {
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

  /**
   * Get RPC URL based on environment
   */
  getRpcUrl() {
    const network = process.env.NETWORK || 'testnet';
    
    if (network === 'mainnet') {
      return process.env.ETHEREUM_RPC_URL;
    } else if (network === 'testnet' || network === 'sepolia') {
      return process.env.SEPOLIA_RPC_URL || process.env.ETHEREUM_RPC_URL;
    } else {
      return process.env.ETHEREUM_RPC_URL;
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
   * Initiate a cross-chain swap on Ethereum
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
      if (!this.ethereumWallet) {
        throw new Error('Ethereum wallet not configured. Please set PRIVATE_KEY in .env file');
      }

      // Check if we have a deployed contract address
      if (this.contractAddresses.ethereum.fusionBridge === '0x0000000000000000000000000000000000000000') {
        throw new Error(`FusionBridge contract not deployed on ${this.getNetworkName()}. Please deploy contracts first and set ETHEREUM_BRIDGE_ADDRESS`);
      }

      // Create transaction to call FusionBridge contract
      const transaction = {
        to: this.contractAddresses.ethereum.fusionBridge,
        value: amount,
        data: this.encodeInitiateSwap(recipient, amount, hashlock, timelock, targetChain),
        gasLimit: 300000
      };

      // Estimate gas
      const estimatedGas = await this.ethereumProvider.estimateGas(transaction);
      transaction.gasLimit = estimatedGas;

      console.log(`🚀 Sending transaction on ${this.getNetworkName()}...`);

      // Send real transaction
      const tx = await this.ethereumWallet.sendTransaction(transaction);
      console.log('📝 Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);

      return {
        success: true,
        transaction: {
          hash: receipt.hash,
          from: receipt.from,
          to: receipt.to,
          value: amount,
          status: receipt.status === 1 ? 'success' : 'failed',
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
          network: this.getNetworkName()
        },
        message: `Swap initiated successfully on ${this.getNetworkName()}`
      };
    } catch (error) {
      console.error('Contract interaction error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a cross-chain swap on Ethereum
   * @param {Object} params - Swap parameters
   * @returns {Promise<Object>} Transaction result
   */
  async executeSwap(params) {
    const {
      fromToken,
      toToken,
      amount,
      recipient,
      hashlock,
      timelock,
      targetChain
    } = params;

    try {
      if (!this.ethereumWallet) {
        throw new Error('Ethereum wallet not configured. Please set PRIVATE_KEY in .env file');
      }

      // Check if we have a deployed contract address
      if (this.contractAddresses.ethereum.fusionBridge === '0x0000000000000000000000000000000000000000') {
        throw new Error(`FusionBridge contract not deployed on ${this.getNetworkName()}. Please deploy contracts first and set ETHEREUM_BRIDGE_ADDRESS`);
      }

      console.log(`🚀 Executing Ethereum swap: ${fromToken} → ${toToken} (${ethers.formatEther(amount)} ETH)`);

      // Create transaction to call FusionBridge contract
      const transaction = {
        to: this.contractAddresses.ethereum.fusionBridge,
        data: this.encodeInitiateSwap(recipient, amount, hashlock, timelock, targetChain),
        gasLimit: 300000,
        value: fromToken === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEeE' ? amount : 0 // Send ETH if native token
      };

      // Estimate gas
      const estimatedGas = await this.ethereumProvider.estimateGas(transaction);
      transaction.gasLimit = estimatedGas;

      // Send transaction
      const tx = await this.ethereumWallet.sendTransaction(transaction);
      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        transaction: {
          hash: receipt.hash,
          status: receipt.status === 1 ? 'success' : 'failed',
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
          network: this.getNetworkName()
        },
        message: `Swap executed successfully on ${this.getNetworkName()}`
      };
    } catch (error) {
      console.error('Execute swap error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Complete a swap on Ethereum
   * @param {string} hashlock - The hashlock of the swap
   * @returns {Promise<Object>} Transaction result
   */
  async completeSwap(hashlock) {
    try {
      if (!this.ethereumWallet) {
        throw new Error('Ethereum wallet not configured');
      }

      if (this.contractAddresses.ethereum.fusionBridge === '0x0000000000000000000000000000000000000000') {
        throw new Error(`FusionBridge contract not deployed on ${this.getNetworkName()}`);
      }

      const transaction = {
        to: this.contractAddresses.ethereum.fusionBridge,
        data: this.encodeCompleteSwap(hashlock),
        gasLimit: 200000
      };

      const estimatedGas = await this.ethereumProvider.estimateGas(transaction);
      transaction.gasLimit = estimatedGas;

      const tx = await this.ethereumWallet.sendTransaction(transaction);
      const receipt = await tx.wait();

      return {
        success: true,
        transaction: {
          hash: receipt.hash,
          status: receipt.status === 1 ? 'success' : 'failed',
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
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
   * Refund a swap on Ethereum
   * @param {string} hashlock - The hashlock of the swap
   * @returns {Promise<Object>} Transaction result
   */
  async refundSwap(hashlock) {
    try {
      if (!this.ethereumWallet) {
        throw new Error('Ethereum wallet not configured');
      }

      if (this.contractAddresses.ethereum.fusionBridge === '0x0000000000000000000000000000000000000000') {
        throw new Error(`FusionBridge contract not deployed on ${this.getNetworkName()}`);
      }

      const transaction = {
        to: this.contractAddresses.ethereum.fusionBridge,
        data: this.encodeRefundSwap(hashlock),
        gasLimit: 150000
      };

      const estimatedGas = await this.ethereumProvider.estimateGas(transaction);
      transaction.gasLimit = estimatedGas;

      const tx = await this.ethereumWallet.sendTransaction(transaction);
      const receipt = await tx.wait();

      return {
        success: true,
        transaction: {
          hash: receipt.hash,
          status: receipt.status === 1 ? 'success' : 'failed',
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
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
      if (this.contractAddresses.ethereum.fusionBridge === '0x0000000000000000000000000000000000000000') {
        throw new Error(`Contract not deployed on ${this.getNetworkName()}. Please deploy FusionBridge contract first`);
      }

      // This would call the getSwapRequest function on the contract
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
   * Encode initiateSwap function call
   * @param {string} recipient - Recipient address
   * @param {string} amount - Amount in wei
   * @param {string} hashlock - Hashlock
   * @param {number} timelock - Timelock
   * @param {string} targetChain - Target chain
   * @returns {string} Encoded function data
   */
  encodeInitiateSwap(recipient, amount, hashlock, timelock, targetChain) {
    // Function signature: initiateSwap(address,uint256,bytes32,uint256,string)
    const functionSignature = 'initiateSwap(address,uint256,bytes32,uint256,string)';
    const functionSelector = ethers.id(functionSignature).slice(0, 10);
    
    // Encode parameters
    const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256', 'bytes32', 'uint256', 'string'],
      [recipient, amount, hashlock, timelock, targetChain]
    );
    
    return functionSelector + encodedParams.slice(2);
  }

  /**
   * Encode completeSwap function call
   * @param {string} hashlock - Hashlock
   * @returns {string} Encoded function data
   */
  encodeCompleteSwap(hashlock) {
    const functionSignature = 'completeSwap(bytes32)';
    const functionSelector = ethers.id(functionSignature).slice(0, 10);
    
    const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32'],
      [hashlock]
    );
    
    return functionSelector + encodedParams.slice(2);
  }

  /**
   * Encode refundSwap function call
   * @param {string} hashlock - Hashlock
   * @returns {string} Encoded function data
   */
  encodeRefundSwap(hashlock) {
    const functionSignature = 'refundSwap(bytes32)';
    const functionSelector = ethers.id(functionSignature).slice(0, 10);
    
    const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32'],
      [hashlock]
    );
    
    return functionSelector + encodedParams.slice(2);
  }

  /**
   * Check if service is properly configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    return !!(this.ethereumProvider && this.privateKey && this.privateKey !== 'your_ethereum_private_key_here');
  }

  /**
   * Get wallet address
   * @returns {string} Wallet address
   */
  getWalletAddress() {
    return this.ethereumWallet ? this.ethereumWallet.address : null;
  }

  /**
   * Get network info
   * @returns {Promise<Object>} Network information
   */
  async getNetworkInfo() {
    try {
      const network = await this.ethereumProvider.getNetwork();
      const blockNumber = await this.ethereumProvider.getBlockNumber();
      
      return {
        chainId: network.chainId,
        name: this.getNetworkName(),
        blockNumber: blockNumber,
        rpcUrl: this.ethereumProvider.connection.url,
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
      this.rpcUrl = this.getRpcUrl();
      
      this.ethereumProvider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      if (this.privateKey) {
        this.ethereumWallet = new ethers.Wallet(this.privateKey, this.ethereumProvider);
      }
      
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

module.exports = ContractService; 