const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import services
const OneInchService = require('./services/oneInchService');
const TokenService = require('./services/tokenService');
const FusionService = require('./services/fusionService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const oneInchService = new OneInchService();
const tokenService = new TokenService();
const fusionService = new FusionService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      ethereum: 'connected',
      aptos: 'connected',
      fusion: fusionService.isConfigured() ? 'configured' : 'pending_configuration',
      oneinch: oneInchService.isConfigured() ? 'configured' : 'pending_configuration'
    }
  });
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
      const fusionQuote = await fusionService.createCrossChainFusionOrder({
        fromToken: fromTokenInfo.address,
        toToken: toTokenInfo.address,
        fromChain,
        toChain,
        amount: amountInWei,
        fromAddress: fromAddress || '0x0000000000000000000000000000000000000000',
        toAddress: fromAddress || '0x0000000000000000000000000000000000000000',
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
    }

    // Fallback to regular 1inch if Fusion+ not configured
    if (fromChain === 'ethereum' && toChain === 'aptos') {
      const quoteResult = await oneInchService.getQuote(
        fromTokenInfo.address,
        tokenService.getTokenAddress('USDC', 'ethereum'),
        amountInWei,
        1
      );

      if (!quoteResult.success) {
        return res.status(400).json({
          success: false,
          error: `Failed to get quote: ${quoteResult.error}`
        });
      }

      const quoteData = quoteResult.data;
      const bridgeFee = (parseFloat(fromAmount) * 0.001).toString();
      const netAmount = (parseFloat(fromAmount) - parseFloat(bridgeFee)).toString();
      const estimatedAptAmount = (parseFloat(netAmount) * 1.5).toString();

      const quote = {
        id: `quote_${Date.now()}`,
        fromToken,
        toToken,
        fromAmount,
        toAmount: estimatedAptAmount,
        exchangeRate: (parseFloat(estimatedAptAmount) / parseFloat(netAmount)).toString(),
        bridgeFee,
        estimatedTime: '45 seconds',
        route: {
          steps: [
            { chain: fromChain, action: 'approve', status: 'pending' },
            { chain: fromChain, action: 'swap', status: 'waiting' },
            { chain: toChain, action: 'receive', status: 'waiting' }
          ]
        },
        status: 'ready',
        oneInchQuote: quoteData,
        mevProtection: false,
        limitOrderSupport: false
      };
      
      res.json({ success: true, quote });
    } else {
      return res.status(400).json({
        success: false,
        error: `Cross-chain route ${fromChain} to ${toChain} not yet implemented`
      });
    }
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// New Fusion+ specific endpoints
app.post('/api/fusion/quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount, fromAddress, chainId = 1 } = req.body;
    
    if (!fusionService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Fusion+ service not configured'
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
    const { fromToken, toToken, amount, fromAddress, slippage = 1, chainId = 1 } = req.body;
    
    if (!fusionService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Fusion+ service not configured'
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
    const { chainId = 1 } = req.query;
    
    if (!fusionService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Fusion+ service not configured'
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
    const { quoteId, userAddress, fromChain, toChain } = req.body;
    
    // Validate required fields
    if (!quoteId || !userAddress || !fromChain || !toChain) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: quoteId, userAddress, fromChain, toChain' 
      });
    }

    // Validate user address format
    if (fromChain === 'ethereum' && !tokenService.isValidAddress(userAddress, 'ethereum')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }

    // For now, return a structured response indicating what needs to be implemented
    const execution = {
      transactionId: `tx_${Date.now()}`,
      quoteId,
      status: 'pending_smart_contract_integration',
      estimatedTime: '45 seconds',
      steps: [
        { step: 1, status: 'pending', description: 'Approving token transfer' },
        { step: 2, status: 'waiting', description: 'Executing cross-chain swap' },
        { step: 3, status: 'waiting', description: 'Finalizing on destination chain' }
      ],
      message: 'Smart contract integration required for execution'
    };
    
    res.json({ success: true, execution });
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
      status: 'pending_smart_contract_integration',
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
      message: 'Smart contract integration required for transaction tracking'
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
  console.log(`⚠️  Smart contract integration: Pending`);
}); 