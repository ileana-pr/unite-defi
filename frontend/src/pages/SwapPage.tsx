import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeftRight, Wallet, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:3001/api'

interface Token {
  symbol: string
  name: string
  chain: string
  address: string
  decimals: number
}

interface Quote {
  id?: string
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  exchangeRate: string
  bridgeFee: string
  estimatedTime: string
  route: {
    steps: Array<{ chain: string; action: string }>
  }
}

export default function SwapPage() {
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('APT')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [swapStatus, setSwapStatus] = useState<'idle' | 'connecting' | 'swapping' | 'success' | 'error'>('idle')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch supported tokens on component mount
  useEffect(() => {
    fetchTokens()
  }, [])

  // Fetch quote when amount or tokens change
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      fetchQuote()
    } else {
      setQuote(null)
      setToAmount('')
    }
  }, [fromAmount, fromToken, toToken])

  const fetchTokens = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens`)
      const data = await response.json()
      if (data.success) {
        setTokens(data.data)
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
    }
  }

  const fetchQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/bridge/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount: fromAmount,
          fromChain: 'ethereum',
          toChain: 'aptos'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setQuote(data.data)
        setToAmount(data.data.toAmount)
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectWallet = () => {
    setIsConnected(true)
    setSwapStatus('connecting')
    setTimeout(() => setSwapStatus('idle'), 2000)
  }

  const handleSwap = async () => {
    if (!fromAmount || !toAmount || !quote) return
    
    setSwapStatus('swapping')
    try {
      const response = await fetch(`${API_BASE_URL}/bridge/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quote.id || 'mock_quote',
          userAddress: '0x123...', // Mock address - replace with actual wallet
          fromChain: 'ethereum',
          toChain: 'aptos'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Poll for status updates
        pollTransactionStatus(data.data.transactionId)
      } else {
        setSwapStatus('error')
      }
    } catch (error) {
      console.error('Error executing bridge:', error)
      setSwapStatus('error')
    }
  }

  const pollTransactionStatus = async (transactionId: string) => {
    const maxAttempts = 10
    let attempts = 0
    
    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bridge/status/${transactionId}`)
        const data = await response.json()
        
        if (data.success && data.data.status === 'completed') {
          setSwapStatus('success')
          return
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000) // Poll every 3 seconds
        } else {
          setSwapStatus('error')
        }
      } catch (error) {
        console.error('Error polling status:', error)
        setSwapStatus('error')
      }
    }
    
    poll()
  }

  const handleSwitchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="text-white font-bold text-xl">FusionBridge</span>
            </Link>
            <Button
              onClick={handleConnectWallet}
              className={`${
                isConnected 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
              } text-white`}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnected ? 'Connected' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Bridge Your Assets
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Seamlessly bridge tokens between Ethereum and Aptos with atomic swap guarantees
            </p>
          </motion.div>

          {/* Swap Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-8 shadow-2xl shadow-cyan-500/10"
          >
            {/* From Token */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">From</span>
                <span className="text-slate-400 text-sm">Ethereum</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="bg-transparent border-none text-white text-2xl font-bold p-0 h-auto"
                  />
                </div>
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                >
                  {tokens.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Switch Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handleSwitchTokens}
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 p-3 rounded-full"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </Button>
            </div>

            {/* To Token */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">To</span>
                <span className="text-slate-400 text-sm">Aptos</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="bg-transparent border-none text-white text-2xl font-bold p-0 h-auto"
                    disabled
                  />
                </div>
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                >
                  {tokens.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Details */}
            {quote && (
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exchange Rate</span>
                    <span className="text-white">1 {fromToken} = {quote.exchangeRate} {toToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bridge Fee</span>
                    <span className="text-white">{quote.bridgeFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Time</span>
                    <span className="text-white">{quote.estimatedTime}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mb-6 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-blue-400">
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Getting quote...</span>
                </div>
              </div>
            )}

            {/* Status Display */}
            {swapStatus !== 'idle' && (
              <div className="mb-6 p-4 rounded-lg border">
                {swapStatus === 'connecting' && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Wallet className="w-4 h-4 animate-pulse" />
                    <span>Connecting wallet...</span>
                  </div>
                )}
                {swapStatus === 'swapping' && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>Processing bridge transaction...</span>
                  </div>
                )}
                {swapStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Bridge completed successfully!</span>
                  </div>
                )}
                {swapStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Bridge failed. Please try again.</span>
                  </div>
                )}
              </div>
            )}

            {/* Bridge Button */}
            <Button
              onClick={handleSwap}
              disabled={!isConnected || !fromAmount || !toAmount || !quote || swapStatus === 'swapping' || loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {swapStatus === 'swapping' ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-spin" />
                  Bridging Assets...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Bridge Assets
                </>
              )}
            </Button>
          </motion.div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl p-6 border border-slate-800 text-center">
              <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Atomic Swaps</h3>
              <p className="text-slate-400 text-sm">Guaranteed atomic swaps with no partial states</p>
            </div>
            <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl p-6 border border-slate-800 text-center">
              <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Fast & Secure</h3>
              <p className="text-slate-400 text-sm">45-second bridge time with MEV protection</p>
            </div>
            <div className="bg-slate-900/30 backdrop-blur-sm rounded-xl p-6 border border-slate-800 text-center">
              <Wallet className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Multi-Wallet</h3>
              <p className="text-slate-400 text-sm">Support for MetaMask, Petra, and 1inch Wallet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 