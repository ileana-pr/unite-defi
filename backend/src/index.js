const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import services
const OneInchService = require('./services/oneInchService');
const TokenService = require('./services/tokenService');
const FusionService = require('./services/fusionService');
const ContractService = require('./services/contractService');
const AptosService = require('./services/aptosService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const oneInchService = new OneInchService();
const tokenService = new TokenService();
const fusionService = new FusionService();
const contractService = new ContractService();
// Initialize Aptos service
const aptosService = new AptosService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const ethereumNetworkInfo = await contractService.getNetworkInfo();
    const aptosNetworkInfo = await aptosService.getNetworkInfo();
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        ethereum: contractService.isConfigured() ? 'configured' : 'pending_configuration',
        aptos: aptosService.isConfigured() ? 'configured' : 'pending_configuration',
        fusion: fusionService.isConfigured() ? 'configured' : 'pending_configuration',
        oneinch: oneInchService.isConfigured() ? 'configured' : 'pending_configuration',
        contracts: contractService.isConfigured() ? 'configured' : 'pending_configuration'
      },
      networks: {
        ethereum: ethereumNetworkInfo,
        aptos: aptosNetworkInfo
      }
    });
  } catch (error) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        ethereum: 'error',
        aptos: aptosService.isConfigured() ? 'configured' : 'pending_configuration',
        fusion: fusionService.isConfigured() ? 'configured' : 'pending_configuration',
        oneinch: oneInchService.isConfigured() ? 'configured' : 'pending_configuration',
        contracts: contractService.isConfigured() ? 'configured' : 'pending_configuration'
      },
      error: error.message
    });
  }
});

// Test Fusion+ API connection
app.get('/api/test/fusion', async (req, res) => {
  try {
    const testResult = await fusionService.testConnection();
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test contract service
app.get('/api/test/contracts', async (req, res) => {
  try {
    const networkInfo = await contractService.getNetworkInfo();
    const walletAddress = contractService.getWalletAddress();
    
    res.json({
      success: true,
      configured: contractService.isConfigured(),
      walletAddress,
      network: networkInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Aptos service
app.get('/api/test/aptos', async (req, res) => {
  try {
    const testResult = await aptosService.testConnection();
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Switch network endpoint
app.post('/api/switch-network', async (req, res) => {
  try {
    const { network } = req.body;
    
    if (!network) {
      return res.status(400).json({
        success: false,
        error: 'Network parameter is required (mainnet, testnet, sepolia, goerli, hardhat)'
      });
    }

    const validNetworks = ['mainnet', 'testnet', 'sepolia', 'goerli', 'hardhat'];
    if (!validNetworks.includes(network)) {
      return res.status(400).json({
        success: false,
        error: `Invalid network. Must be one of: ${validNetworks.join(', ')}`
      });
    }

    // Switch networks in all services
    const contractResult = await contractService.switchNetwork(network);
    const fusionResult = await fusionService.switchNetwork(network);
    const aptosResult = await aptosService.switchNetwork(network);

    res.json({
      success: true,
      message: `Switched to ${network}`,
      contractService: contractResult,
      fusionService: fusionResult,
      aptosService: aptosResult,
      currentNetwork: network
    });
  } catch (error) {
    console.error('Network switch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bridge API endpoints
app.post('/api/bridge/quote', async (req, res) => {
  try {
    const { fromToken, toToken, fromAmount, fromChain, toChain, fromAddress } = req.body;
    
    // Validate required fields
    if (!fromToken || !toToken || !fromAmount || !fromChain || !toChain) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: fromToken, toToken, fromAmount, fromChain, toChain' 
      });
    }

    // Validate token support
    if (!tokenService.isTokenSupported(fromToken, fromChain)) {
      return res.status(400).json({
        success: false,
        error: `Token ${fromToken} not supported on ${fromChain}`
      });
    }

    if (!tokenService.isTokenSupported(toToken, toChain)) {
      return res.status(400).json({
        success: false,
        error: `Token ${toToken} not supported on ${toChain}`
      });
    }

    // Get token information
    const fromTokenInfo = tokenService.getToken(fromToken, fromChain);
    const toTokenInfo = tokenService.getToken(toToken, toChain);
    
    // Convert amount to wei
    const amountInWei = tokenService.toWei(fromAmount, fromTokenInfo.decimals);

    // Use Fusion+ service for cross-chain quotes
    if (fusionService.isConfigured()) {
      try {
        const fusionQuote = await fusionService.createCrossChainFusionOrder({
          fromToken: fromTokenInfo.address,
          toToken: toTokenInfo.address,
          fromChain,
          toChain,
          amount: amountInWei,
          fromAddress: fromAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          toAddress: fromAddress || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          slippage: 1
        });

        if (fusionQuote.success) {
          const orderData = fusionQuote.data;
          
          const quote = {
            id: orderData.orderId,
            fromToken,
            toToken,
            fromAmount,
            toAmount: orderData.destinationOrder.estimatedAmount,
            exchangeRate: (parseFloat(orderData.destinationOrder.estimatedAmount) / parseFloat(fromAmount)).toString(),
            bridgeFee: orderData.fees.bridgeFee,
            estimatedTime: orderData.estimatedTime,
            route: {
              steps: [
                { chain: fromChain, action: 'approve', status: 'pending' },
                { chain: fromChain, action: 'fusion_swap', status: 'waiting' },
                { chain: toChain, action: 'receive', status: 'waiting' }
              ]
            },
            status: 'ready',
            fusionOrder: orderData,
            mevProtection: true,
            limitOrderSupport: true
          };
          
          return res.json({ success: true, quote });
        } else {
          console.error('Fusion+ quote error:', fusionQuote.error);
        }
      } catch (error) {
        console.error('Fusion+ service error:', error.message);
        // Continue to fallback
      }
    }

    // Mock quote for testing (when Fusion+ fails)
    console.log('📋 Using mock quote for testing...');
    const mockQuote = {
      id: `mock_${Date.now()}`,
      fromToken,
      toToken,
      fromAmount,
      toAmount: (parseFloat(fromAmount) * 0.85).toString(), // Mock exchange rate
      exchangeRate: '0.85',
      bridgeFee: '0.1%',
      estimatedTime: '45 seconds',
      route: {
        steps: [
          { chain: fromChain, action: 'approve', status: 'pending' },
          { chain: fromChain, action: 'swap', status: 'waiting' },
          { chain: toChain, action: 'receive', status: 'waiting' }
        ]
      },
      status: 'ready',
      mevProtection: true,
      limitOrderSupport: false,
      note: 'Mock quote for testing - Fusion+ API not available'
    };
    
    return res.json({ success: true, quote: mockQuote });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// New Fusion+ specific endpoints
app.post('/api/fusion/quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount, fromAddress, chainId = 11155111 } = req.body;
    
    if (!fusionService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Fusion+ service not configured. Please set FUSION_API_KEY in .env file'
      });
    }

    const quote = await fusionService.getFusionQuote(
      fromToken,
      toToken,
      amount,
      fromAddress,
      chainId
    );

    res.json(quote);
  } catch (error) {
    console.error('Fusion+ quote error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/fusion/order', async (req, res) => {
  try {
    const { fromToken, toToken, amount, fromAddress, slippage = 1, chainId = 11155111 } = req.body;
    
    if (!fusionService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Fusion+ service not configured. Please set FUSION_API_KEY in .env file'
      });
    }

    const order = await fusionService.createFusionOrder(
      fromToken,
      toToken,
      amount,
      fromAddress,
      slippage,
      chainId
    );

    res.json(order);
  } catch (error) {
    console.error('Fusion+ order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/fusion/order/:orderHash', async (req, res) => {
  try {
    const { orderHash } = req.params;
    const { chainId = 11155111 } = req.query;
    
    if (!fusionService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Fusion+ service not configured. Please set FUSION_API_KEY in .env file'
      });
    }

    const status = await fusionService.getFusionOrderStatus(orderHash, chainId);
    res.json(status);
  } catch (error) {
    console.error('Fusion+ status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/bridge/execute', async (req, res) => {
  try {
    const { quoteId, userAddress, fromChain, toChain, fromToken, toToken, fromAmount } = req.body;
    
    // Validate required fields
    if (!quoteId || !userAddress || !fromChain || !toChain || !fromToken || !toToken || !fromAmount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: quoteId, userAddress, fromChain, toChain, fromToken, toToken, fromAmount' 
      });
    }

    // Validate user address format
    if (fromChain === 'ethereum' && !tokenService.isValidAddress(userAddress, 'ethereum')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }

    // Check if contract service is configured
    if (!contractService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Contract service not configured. Please set PRIVATE_KEY and deploy contracts'
      });
    }

    // Generate a unique hashlock for this swap
    const hashlock = ethers.keccak256(ethers.toUtf8Bytes(`${quoteId}-${Date.now()}`));
    const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    try {
      let ethereumTxHash = null;
      let aptosTxHash = null;
      
      // Use the provided token information
      const quoteDetails = {
        fromToken,
        toToken,
        fromAmount
      };
      
      // Step 1: Execute on source chain (Ethereum) using 1inch Fusion+
      if (fromChain === 'ethereum') {
        console.log(`🔗 Executing Ethereum swap: ${quoteDetails.fromToken} → ${quoteDetails.toToken}`);
        
        if (!contractService.isConfigured()) {
          throw new Error('Ethereum contract service not configured');
        }
        
        // Get token info
        const fromTokenInfo = tokenService.getToken(quoteDetails.fromToken, fromChain);
        const toTokenInfo = tokenService.getToken(quoteDetails.toToken, toChain);
        
        // Use 1inch Fusion+ for real cross-chain swap
        if (fusionService.isConfigured()) {
          console.log('🚀 Using 1inch Fusion+ for cross-chain execution...');
          
          // Create Fusion+ order for cross-chain swap
          const fusionOrder = await fusionService.createCrossChainFusionOrder({
            fromToken: fromTokenInfo.address,
            toToken: toTokenInfo.address,
            fromChain,
            toChain,
            amount: tokenService.toWei(quoteDetails.fromAmount, fromTokenInfo.decimals),
            fromAddress: userAddress,
            toAddress: userAddress,
            slippage: 1
          });
          
          if (fusionOrder.success) {
            console.log('✅ Fusion+ cross-chain order created:', fusionOrder.data.orderId);
            ethereumTxHash = fusionOrder.data.sourceOrder.quote.tx?.hash || 'pending';
          } else {
            throw new Error(`Fusion+ order failed: ${fusionOrder.error}`);
          }
        } else {
          // Fallback to direct contract execution
          const ethereumResult = await contractService.executeSwap({
            fromToken: fromTokenInfo.address,
            toToken: toTokenInfo.address,
            amount: tokenService.toWei(quoteDetails.fromAmount, fromTokenInfo.decimals),
            recipient: userAddress,
            hashlock,
            timelock,
            targetChain: toChain
          });
          
          if (ethereumResult.success) {
            ethereumTxHash = ethereumResult.transactionHash;
            console.log(`✅ Ethereum swap executed: ${ethereumTxHash}`);
          } else {
            throw new Error(`Ethereum swap failed: ${ethereumResult.error}`);
          }
        }
      }
      
      // Step 2: Execute on destination chain (Aptos) after Ethereum verification
      if (toChain === 'aptos') {
        console.log(`🔗 Executing Aptos swap: ${fromToken} → ${toToken}`);
        
        if (!aptosService.isConfigured()) {
          throw new Error('Aptos service not configured');
        }
        
        // In a production bridge, we would:
        // 1. Wait for Ethereum transaction confirmation
        // 2. Verify the transaction on Ethereum blockchain
        // 3. Check that ETH was locked in the bridge contract
        // 4. Only then execute the Aptos transaction
        
        // For now, we'll simulate the verification process
        console.log('🔍 Verifying Ethereum transaction...');
        console.log('✅ Ethereum transaction verified (simulated)');
        
        // Execute the swap on Aptos
        const aptosResult = await aptosService.initiateSwap({
          recipient: userAddress,
          amount: quoteDetails.fromAmount,
          hashlock,
          timelock,
          targetChain: fromChain
        });
        
        if (aptosResult.success) {
          console.log('🔍 Aptos result structure:', JSON.stringify(aptosResult, null, 2));
          aptosTxHash = aptosResult.transaction?.hash;
          console.log(`✅ Aptos swap executed: ${aptosTxHash}`);
        } else {
          throw new Error(`Aptos swap failed: ${aptosResult.error}`);
        }
      }
      
      // Return successful execution result
      const execution = {
        transactionId: `tx_${Date.now()}`,
        quoteId,
        status: 'executed',
        estimatedTime: '45 seconds',
        steps: [
          { step: 1, status: 'completed', description: 'Source chain swap executed', txHash: ethereumTxHash },
          { step: 2, status: 'completed', description: 'Destination chain swap executed', txHash: aptosTxHash },
          { step: 3, status: 'completed', description: 'Cross-chain bridge completed' }
        ],
        hashlock,
        timelock,
        ethereumTxHash,
        aptosTxHash,
        message: 'Cross-chain swap executed successfully!'
      };
      
      res.json({ success: true, execution });
      
    } catch (error) {
      console.error('❌ Swap execution failed:', error.message);
      
      const execution = {
        transactionId: `tx_${Date.now()}`,
        quoteId,
        status: 'failed',
        error: error.message,
        steps: [
          { step: 1, status: 'failed', description: 'Swap execution failed' },
          { step: 2, status: 'cancelled', description: 'Cross-chain bridge cancelled' },
          { step: 3, status: 'cancelled', description: 'Transaction rolled back' }
        ],
        message: `Swap failed: ${error.message}`
      };
      
      res.json({ success: false, execution });
    }
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/bridge/status/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction ID is required' 
      });
    }

    // TODO: Implement actual transaction tracking
    // This should query both Ethereum and Aptos chains for transaction status
    const status = {
      transactionId,
      status: 'pending_contract_deployment',
      fromChain: 'ethereum',
      toChain: 'aptos',
      fromAmount: '10',
      toAmount: '15',
      timestamp: new Date().toISOString(),
      steps: [
        { step: 1, status: 'pending', timestamp: new Date(Date.now() - 30000).toISOString() },
        { step: 2, status: 'pending', timestamp: new Date(Date.now() - 15000).toISOString() },
        { step: 3, status: 'pending', timestamp: new Date().toISOString() }
      ],
      message: 'Smart contracts need to be deployed to testnet first'
    };
    
    res.json({ success: true, status });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supported tokens endpoint
app.get('/api/tokens', (req, res) => {
  try {
    const tokens = tokenService.getAllTokens();
    res.json({ success: true, tokens });
  } catch (error) {
    console.error('Tokens error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tokens for specific chain
app.get('/api/tokens/:chain', (req, res) => {
  try {
    const { chain } = req.params;
    
    if (chain !== 'ethereum' && chain !== 'aptos') {
      return res.status(400).json({
        success: false,
        error: 'Chain must be either "ethereum" or "aptos"'
      });
    }

    const tokens = tokenService.getTokensForChain(chain);
    res.json({ success: true, tokens });
  } catch (error) {
    console.error('Tokens error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get supported token pairs
app.get('/api/pairs', (req, res) => {
  try {
    const pairs = tokenService.getSupportedPairs();
    res.json({ success: true, pairs });
  } catch (error) {
    console.error('Pairs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api/test/fusion',
      'GET /api/test/contracts',
      'GET /api/test/aptos',
      'POST /api/switch-network',
      'POST /api/bridge/quote',
      'POST /api/bridge/execute', 
      'GET /api/bridge/status/:transactionId',
      'POST /api/fusion/quote',
      'POST /api/fusion/order',
      'GET /api/fusion/order/:orderHash',
      'GET /api/tokens',
      'GET /api/tokens/:chain',
      'GET /api/pairs'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FusionBridge Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 1inch API: ${oneInchService.isConfigured() ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`⚡ Fusion+ API: ${fusionService.isConfigured() ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🔗 Contract Service: ${contractService.isConfigured() ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📝 Get 1inch API key: https://portal.1inch.dev/`);
  console.log(`⚠️  Deploy contracts to testnet for full functionality`);
}); 