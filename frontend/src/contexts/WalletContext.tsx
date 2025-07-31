import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { AptosWalletAdapterProvider, useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'
import { PetraWallet } from 'petra-plugin-wallet-adapter'
import { PontemWallet } from '@pontem/wallet-adapter-plugin'
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter'

// Note: For testing, make sure your Aptos wallet (Petra, Pontem, etc.) is configured to use TESTNET
// In your wallet settings, switch from "Mainnet" to "Testnet" to avoid real transactions

interface WalletState {
  // Ethereum
  ethereumAccount: string | null
  ethereumChainId: number | null
  ethereumProvider: any | null
  
  // Aptos
  aptosAccount: string | null
  aptosConnected: boolean
  
  // Connection states
  isConnecting: boolean
  error: string | null
}

interface WalletContextType extends WalletState {
  // Ethereum methods
  connectEthereum: (connectorType: 'metamask' | 'walletconnect' | '1inch') => Promise<void>
  disconnectEthereum: () => void
  
  // Aptos methods
  connectAptos: () => Promise<void>
  disconnectAptos: () => void
  
  // Utility methods
  getConnectedWallets: () => string[]
  isWalletConnected: (chain: 'ethereum' | 'aptos') => boolean
  getAvailableWallets: () => { name: string; available: boolean }[]
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Configure Aptos wallets
const aptosWallets = [
  new PetraWallet(),
  new PontemWallet(),
  new MartianWallet()
]

// Combined Wallet Provider
export function WalletProvider({ children }: { children: ReactNode }) {
  const [ethereumAccount, setEthereumAccount] = useState<string | null>(null)
  const [ethereumChainId, setEthereumChainId] = useState<number | null>(null)
  const [ethereumProvider, setEthereumProvider] = useState<any | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('WalletProvider render:', {
    ethereumAccount,
    ethereumChainId,
    isConnecting,
    error
  })

  const connectEthereum = async (connectorType: 'metamask' | 'walletconnect' | '1inch') => {
    console.log('connectEthereum called with:', connectorType)
    setIsConnecting(true)
    setError(null)
    
    try {
      if (connectorType === 'metamask') {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
        }

        console.log('MetaMask detected, requesting accounts...')

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
        
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        console.log('MetaMask connected:', { account, chainId })
        
        setEthereumAccount(account)
        setEthereumChainId(parseInt(chainId, 16))
        setEthereumProvider(window.ethereum)
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          setEthereumAccount(accounts[0] || null)
        })
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId: string) => {
          setEthereumChainId(parseInt(chainId, 16))
        })
        
      } else if (connectorType === '1inch') {
        // Check if 1inch Wallet is installed
        if (typeof window.ethereum === 'undefined') {
          throw new Error('1inch Wallet is not installed. Please install 1inch Wallet to continue.')
        }

        // Check if it's 1inch Wallet (you can detect this by checking the provider name)
        const provider = window.ethereum
        const is1inchWallet = provider.is1inchWallet || 
                             provider.providers?.some((p: any) => p.is1inchWallet) ||
                             provider.constructor.name === 'OneInchWalletProvider'

        if (!is1inchWallet) {
          throw new Error('1inch Wallet is not installed. Please install 1inch Wallet to continue.')
        }

        // Request account access
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' })
        
        setEthereumAccount(account)
        setEthereumChainId(parseInt(chainId, 16))
        setEthereumProvider(provider)
        
        // Listen for account changes
        provider.on('accountsChanged', (accounts: string[]) => {
          setEthereumAccount(accounts[0] || null)
        })
        
        // Listen for chain changes
        provider.on('chainChanged', (chainId: string) => {
          setEthereumChainId(parseInt(chainId, 16))
        })
        
      } else if (connectorType === 'walletconnect') {
        // Mock WalletConnect implementation
        setEthereumAccount('0x1234567890abcdef...')
        setEthereumChainId(1)
        setEthereumProvider(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
      console.error('Wallet connection error:', err)
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectEthereum = () => {
    setEthereumAccount(null)
    setEthereumChainId(null)
    setEthereumProvider(null)
  }

  const connectAptos = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      // The Aptos wallet adapter will automatically show wallet selection
      // when the user clicks connect. We don't need to manually trigger it.
      console.log('Aptos wallet connection requested - user will see wallet selection')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Aptos wallet'
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectAptos = () => {
    // This will be handled by the Aptos wallet adapter
    console.log('Aptos disconnect requested')
  }

  const getConnectedWallets = () => {
    const wallets = []
    if (ethereumAccount) wallets.push('ethereum')
    // Note: Aptos wallet state is managed by the adapter
    return wallets
  }

  const isWalletConnected = (chain: 'ethereum' | 'aptos') => {
    return chain === 'ethereum' ? !!ethereumAccount : false
  }

  const getAvailableWallets = () => {
    const wallets = [
      { name: 'MetaMask', available: typeof window.ethereum !== 'undefined' },
      { name: '1inch Wallet', available: typeof window.ethereum !== 'undefined' && 
        !!(window.ethereum.is1inchWallet || 
         window.ethereum.providers?.some((p: any) => p.is1inchWallet)) },
      { name: 'WalletConnect', available: true } // Always available as fallback
    ]
    return wallets
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
    >
      <AptosWalletWrapper
        ethereumAccount={ethereumAccount}
        ethereumChainId={ethereumChainId}
        ethereumProvider={ethereumProvider}
        isConnecting={isConnecting}
        error={error}
        connectEthereum={connectEthereum}
        disconnectEthereum={disconnectEthereum}
        connectAptos={connectAptos}
        disconnectAptos={disconnectAptos}
        getConnectedWallets={getConnectedWallets}
        isWalletConnected={isWalletConnected}
        getAvailableWallets={getAvailableWallets}
      >
        {children}
      </AptosWalletWrapper>
    </AptosWalletAdapterProvider>
  )
}

// Wrapper component to access Aptos wallet hooks
function AptosWalletWrapper({ 
  children, 
  ethereumAccount,
  ethereumChainId,
  ethereumProvider,
  isConnecting,
  error,
  connectEthereum,
  disconnectEthereum,
  connectAptos,
  disconnectAptos,
  getConnectedWallets,
  isWalletConnected,
  getAvailableWallets
}: { 
  children: ReactNode
  ethereumAccount: string | null
  ethereumChainId: number | null
  ethereumProvider: any | null
  isConnecting: boolean
  error: string | null
  connectEthereum: (connectorType: 'metamask' | 'walletconnect' | '1inch') => Promise<void>
  disconnectEthereum: () => void
  connectAptos: () => Promise<void>
  disconnectAptos: () => void
  getConnectedWallets: () => string[]
  isWalletConnected: (chain: 'ethereum' | 'aptos') => boolean
  getAvailableWallets: () => { name: string; available: boolean }[]
}) {
  const { account, connected, disconnect } = useAptosWallet()
  
  console.log('AptosWalletWrapper state:', { account, connected })
  
  // Combine Ethereum and Aptos states
  const combinedGetConnectedWallets = () => {
    const wallets = []
    if (ethereumAccount) wallets.push('ethereum')
    if (connected) wallets.push('aptos')
    return wallets
  }

  const combinedIsWalletConnected = (chain: 'ethereum' | 'aptos') => {
    return chain === 'ethereum' ? !!ethereumAccount : connected
  }

  const combinedDisconnectAptos = () => {
    disconnect()
  }

  return (
    <WalletContext.Provider value={{
      ethereumAccount,
      ethereumChainId,
      ethereumProvider,
      aptosAccount: account?.address?.toString() || null,
      aptosConnected: connected,
      isConnecting,
      error,
      connectEthereum,
      disconnectEthereum,
      connectAptos,
      disconnectAptos: combinedDisconnectAptos,
      getConnectedWallets: combinedGetConnectedWallets,
      isWalletConnected: combinedIsWalletConnected,
      getAvailableWallets,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Add window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      is1inchWallet?: boolean
      providers?: any[]
    }
  }
} 