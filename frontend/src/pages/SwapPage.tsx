import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight, Wallet, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCrossChainWallet } from '@/hooks/useCrossChainWallet'

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
  const { ethereumAddress, aptosAddress, isConnected, connectWallet, disconnectWallet, primaryWalletType, isConnecting, error } = useCrossChainWallet()
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('APT')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [swapStatus, setSwapStatus] = useState<'idle' | 'connecting' | 'swapping' | 'success' | 'error'>('idle')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Get the active wallet address for API calls
  const getActiveWalletAddress = () => {
    return ethereumAddress || aptosAddress
  }

  // Handle wallet connection
  const handleWalletConnect = async (walletType: 'metamask' | '1inch' | 'phantom' | 'coinbase' | 'petra' | 'pontem' | 'martian') => {
    try {
      await connectWallet(walletType)
      setShowWalletSelector(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  // Toggle wallet selector
  const toggleWalletSelector = () => {
    setShowWalletSelector(!showWalletSelector)
  }

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
          fromChain: 'ethereum',
          toChain: 'aptos',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setQuote(data.quote)
        setToAmount(data.quote.toAmount)
      } else {
        console.error('Quote error:', data.error)
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
          userAddress: getActiveWalletAddress(),
          fromChain: 'ethereum',
          toChain: 'aptos',
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Show implementation status
        setSwapStatus('success')
        console.log('Swap execution response:', data.execution)
        // Note: Polling disabled since implementation is pending
        // pollTransactionStatus(data.execution.transactionId)
      } else {
        setSwapStatus('error')
        console.error('Execution error:', data.error)
      }
    } catch (error) {
      console.error('Failed to execute swap:', error)
      setSwapStatus('error')
    }
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
            <div className="flex items-center space-x-4">
              {/* Cross-chain wallet connection */}
              {!isConnected ? (
                <Button
                  onClick={toggleWalletSelector}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Cross-Chain Wallet
                </Button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-300">
                    <div>Connected: {primaryWalletType}</div>
                    <div>ETH: {ethereumAddress?.slice(0, 6)}...{ethereumAddress?.slice(-4)}</div>
                    <div>APT: {aptosAddress?.slice(0, 6)}...{aptosAddress?.slice(-4)}</div>
                  </div>
                  <Button
                    onClick={disconnectWallet}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet selector interface */}
        {showWalletSelector && (
          <div className="mb-8 bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h2 className="text-2xl font-bold mb-6">Connect Cross-Chain Wallet</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Ethereum Wallets */}
              <Button
                onClick={() => handleWalletConnect('metamask')}
                disabled={isConnecting}
                className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">MetaMask</div>
                <div className="text-sm opacity-80">Ethereum</div>
              </Button>
              
              <Button
                onClick={() => handleWalletConnect('1inch')}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">1inch</div>
                <div className="text-sm opacity-80">DeFi Wallet</div>
              </Button>
              
              <Button
                onClick={() => handleWalletConnect('phantom')}
                disabled={isConnecting}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">Phantom</div>
                <div className="text-sm opacity-80">Multi-Chain</div>
              </Button>
              
              <Button
                onClick={() => handleWalletConnect('coinbase')}
                disabled={isConnecting}
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">Coinbase</div>
                <div className="text-sm opacity-80">Exchange</div>
              </Button>
              
              {/* Aptos Wallets */}
              <Button
                onClick={() => handleWalletConnect('petra')}
                disabled={isConnecting}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">Petra</div>
                <div className="text-sm opacity-80">Aptos</div>
              </Button>
              
              <Button
                onClick={() => handleWalletConnect('pontem')}
                disabled={isConnecting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">Pontem</div>
                <div className="text-sm opacity-80">Aptos</div>
              </Button>
              
              <Button
                onClick={() => handleWalletConnect('martian')}
                disabled={isConnecting}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex flex-col items-center space-y-2"
              >
                <div className="text-lg font-semibold">Martian</div>
                <div className="text-sm opacity-80">Aptos</div>
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Button
                onClick={() => setShowWalletSelector(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
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


      </div>
    </div>
  )
} 