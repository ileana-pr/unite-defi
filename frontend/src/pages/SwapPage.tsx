import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight, Wallet, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWallet } from '@/contexts/WalletContext'
import WalletConnect from '@/components/WalletConnect'
import WalletTest from '@/components/WalletTest'

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
  const { ethereumAccount, aptosAccount, isWalletConnected } = useWallet()
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('APT')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [swapStatus, setSwapStatus] = useState<'idle' | 'connecting' | 'swapping' | 'success' | 'error'>('idle')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)

  const isConnected = isWalletConnected('ethereum') || isWalletConnected('aptos')

  // Fetch available tokens on component mount
  useEffect(() => {
    fetchTokens()
  }, [])

  // Fetch quote when fromAmount, fromToken, or toToken changes
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      fetchQuote()
    } else {
      setQuote(null)
    }
  }, [fromAmount, fromToken, toToken])

  const fetchTokens = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens`)
      const data = await response.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  const fetchQuote = async () => {
    if (!fromAmount || !fromToken || !toToken) return

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
          fromAmount,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setQuote(data.quote)
        setToAmount(data.quote.toAmount)
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!quote || !isConnected) return

    setSwapStatus('swapping')
    try {
      const response = await fetch(`${API_BASE_URL}/bridge/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quote.id,
          fromToken,
          toToken,
          fromAmount,
          toAmount,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSwapStatus('success')
        // Poll for transaction status
        pollTransactionStatus(data.transactionId)
      } else {
        setSwapStatus('error')
      }
    } catch (error) {
      console.error('Failed to execute swap:', error)
      setSwapStatus('error')
    }
  }

  const pollTransactionStatus = async (transactionId: string) => {
    const maxAttempts = 30
    let attempts = 0

    const poll = async () => {
      if (attempts >= maxAttempts) return

      try {
        const response = await fetch(`${API_BASE_URL}/bridge/status/${transactionId}`)
        const data = await response.json()

        if (data.status === 'completed') {
          setSwapStatus('success')
          return
        } else if (data.status === 'failed') {
          setSwapStatus('error')
          return
        }

        attempts++
        setTimeout(poll, 2000) // Poll every 2 seconds
      } catch (error) {
        console.error('Failed to poll transaction status:', error)
        attempts++
        setTimeout(poll, 2000)
      }
    }

    poll()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-white">
              1inch Aptos Bridge
            </Link>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Swap Interface */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h2 className="text-2xl font-bold mb-6">Bridge Assets</h2>
              
              {/* From Token */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    From
                  </label>
                  <div className="flex space-x-3">
                    <select
                      value={fromToken}
                      onChange={(e) => setFromToken(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {tokens.map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center my-4">
                <div className="bg-slate-800 rounded-full p-2">
                  <ArrowLeftRight className="w-6 h-6 text-cyan-500" />
                </div>
              </div>

              {/* To Token */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    To
                  </label>
                  <div className="flex space-x-3">
                    <select
                      value={toToken}
                      onChange={(e) => setToToken(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {tokens.map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    You'll Receive
                  </label>
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!isConnected || !quote || loading || swapStatus === 'swapping'}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                {swapStatus === 'swapping' ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Bridging...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Bridge Assets
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quote Details */}
          <div className="space-y-6">
            {quote && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Quote Details</h3>
                <div className="space-y-3">
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

                <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Route</h4>
                  <div className="space-y-1">
                    {quote.route.steps.map((step, index) => (
                      <div key={index} className="text-sm text-slate-400">
                        {step.chain}: {step.action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {swapStatus === 'success' && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400">Bridge transaction completed successfully!</span>
                </div>
              </div>
            )}

            {swapStatus === 'error' && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-400">Bridge transaction failed. Please try again.</span>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4">Why Choose 1inch Aptos Bridge?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Secure & Atomic</h4>
                    <p className="text-sm text-slate-400">Cross-chain transactions are atomic and secure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Fast & Efficient</h4>
                    <p className="text-sm text-slate-400">Optimized routing for the best rates and speed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ArrowLeftRight className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Multi-Chain Support</h4>
                    <p className="text-sm text-slate-400">Bridge between Ethereum and Aptos seamlessly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Test Component */}
        <div className="mt-8">
          <WalletTest />
        </div>
      </div>
    </div>
  )
} 