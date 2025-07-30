const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Bridge API endpoints
app.post('/api/bridge/quote', (req, res) => {
  try {
    const { fromToken, toToken, amount, fromChain, toChain } = req.body;
    
    // Mock quote response - replace with actual 1inch Fusion+ integration
    const quote = {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: (parseFloat(amount) * 1.5).toString(), // Mock exchange rate
      exchangeRate: '1.5',
      bridgeFee: '0.1%',
      estimatedTime: '45 seconds',
      route: {
        steps: [
          { chain: fromChain, action: 'approve' },
          { chain: fromChain, action: 'swap' },
          { chain: toChain, action: 'receive' }
        ]
      }
    };
    
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/bridge/execute', (req, res) => {
  try {
    const { quoteId, userAddress, fromChain, toChain } = req.body;
    
    // Mock execution response - replace with actual bridge execution
    const execution = {
      transactionId: `tx_${Date.now()}`,
      status: 'pending',
      estimatedTime: '45 seconds',
      steps: [
        { step: 1, status: 'pending', description: 'Approving token transfer' },
        { step: 2, status: 'waiting', description: 'Executing cross-chain swap' },
        { step: 3, status: 'waiting', description: 'Finalizing on destination chain' }
      ]
    };
    
    res.json({ success: true, data: execution });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/bridge/status/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Mock status response - replace with actual transaction tracking
    const status = {
      transactionId,
      status: 'completed',
      fromChain: 'ethereum',
      toChain: 'aptos',
      fromAmount: '10',
      toAmount: '15',
      timestamp: new Date().toISOString(),
      steps: [
        { step: 1, status: 'completed', timestamp: new Date(Date.now() - 30000).toISOString() },
        { step: 2, status: 'completed', timestamp: new Date(Date.now() - 15000).toISOString() },
        { step: 3, status: 'completed', timestamp: new Date().toISOString() }
      ]
    };
    
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supported tokens endpoint
app.get('/api/tokens', (req, res) => {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', chain: 'ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'APT', name: 'Aptos', chain: 'aptos', address: '0x1::aptos_coin::AptosCoin', decimals: 8 },
    { symbol: 'USDC', name: 'USD Coin', chain: 'ethereum', address: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', decimals: 6 },
    { symbol: 'USDT', name: 'Tether', chain: 'ethereum', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 }
  ];
  
  res.json({ success: true, data: tokens });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FusionBridge Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 