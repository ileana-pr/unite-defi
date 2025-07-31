import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, ChevronDown, CheckCircle, X } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import AptosWalletModal from './AptosWalletModal'

interface WalletConnectProps {
  className?: string
}

export default function WalletConnect({ className }: WalletConnectProps) {
  const {
    ethereumAccount,
    aptosAccount,
    isConnecting,
    error,
    connectEthereum,
    disconnectEthereum,
    connectAptos,
    disconnectAptos,
    getConnectedWallets,
    getAvailableWallets,
  } = useWallet()

  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [showAptosModal, setShowAptosModal] = useState(false)

  const handleConnectEthereum = async (walletType: 'metamask' | '1inch' | 'walletconnect') => {
    try {
      await connectEthereum(walletType)
      setShowWalletOptions(false)
    } catch (error) {
      console.error('Failed to connect Ethereum wallet:', error)
    }
  }

  const handleConnectAptos = async () => {
    setShowAptosModal(true)
    setShowWalletOptions(false)
  }

  const handleDisconnect = () => {
    if (ethereumAccount) {
      disconnectEthereum()
    }
    if (aptosAccount) {
      disconnectAptos()
    }
    setShowWalletOptions(false)
  }

  const connectedWallets = getConnectedWallets()
  const isConnected = connectedWallets.length > 0
  const availableWallets = getAvailableWallets()

  console.log('WalletConnect render:', {
    ethereumAccount,
    aptosAccount,
    isConnecting,
    error,
    showWalletOptions
  })

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleToggleWalletOptions = () => {
    console.log('handleToggleWalletOptions called, current state:', showWalletOptions)
    setShowWalletOptions(!showWalletOptions)
  }

  if (isConnected) {
    return (
      <div className={`relative ${className}`}>
        <Button
          onClick={handleToggleWalletOptions}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {connectedWallets.length === 1 
            ? formatAddress(ethereumAccount || aptosAccount || '')
            : `${connectedWallets.length} Wallets`
          }
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>

        {showWalletOptions && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="p-4">
              <h3 className="text-white font-medium mb-3">Connected Wallets</h3>
              
              {ethereumAccount && (
                <div className="flex items-center justify-between mb-3 p-2 bg-slate-700 rounded">
                  <div>
                    <div className="text-white text-sm font-medium">Ethereum Wallet</div>
                    <div className="text-slate-300 text-xs">{formatAddress(ethereumAccount)}</div>
                  </div>
                  <Button
                    onClick={disconnectEthereum}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {aptosAccount && (
                <div className="flex items-center justify-between mb-3 p-2 bg-slate-700 rounded">
                  <div>
                    <div className="text-white text-sm font-medium">Aptos Wallet</div>
                    <div className="text-slate-300 text-xs">{formatAddress(aptosAccount)}</div>
                  </div>
                  <Button
                    onClick={disconnectAptos}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                Disconnect All
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <Button
          onClick={handleToggleWalletOptions}
          disabled={isConnecting}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>

        {showWalletOptions && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="p-4">
              <h3 className="text-white font-medium mb-3">Choose Wallet</h3>
              
              {/* Ethereum Wallets */}
              <div className="mb-4">
                <h4 className="text-slate-400 text-xs font-medium mb-2">ETHEREUM</h4>
                
                {availableWallets.find(w => w.name === 'MetaMask')?.available && (
                  <Button
                    onClick={() => handleConnectEthereum('metamask')}
                    disabled={isConnecting}
                    className="w-full mb-2 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <div className="w-6 h-6 mr-2">🦊</div>
                    MetaMask
                  </Button>
                )}

                {availableWallets.find(w => w.name === '1inch Wallet')?.available && (
                  <Button
                    onClick={() => handleConnectEthereum('1inch')}
                    disabled={isConnecting}
                    className="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <div className="w-6 h-6 mr-2">🔵</div>
                    1inch Wallet
                  </Button>
                )}

                <Button
                  onClick={() => handleConnectEthereum('walletconnect')}
                  disabled={isConnecting}
                  className="w-full mb-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <div className="w-6 h-6 mr-2">🔗</div>
                  WalletConnect
                </Button>
              </div>

              {/* Aptos Wallets */}
              <div className="mb-2">
                <h4 className="text-slate-400 text-xs font-medium mb-2">APTOS</h4>
                <Button
                  onClick={handleConnectAptos}
                  disabled={isConnecting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <div className="w-6 h-6 mr-2">🟣</div>
                  Aptos Wallets
                </Button>
                <div className="text-xs text-slate-400 mt-1 px-2">
                  Petra • Pontem • Martian
                </div>
              </div>

              {error && (
                <div className="mt-3 p-2 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AptosWalletModal 
        isOpen={showAptosModal} 
        onClose={() => setShowAptosModal(false)} 
      />
    </>
  )
} 