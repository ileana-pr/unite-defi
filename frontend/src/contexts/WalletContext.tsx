import React, { createContext, useState, type ReactNode } from 'react'

interface CrossChainWalletState {
  // Primary wallet (Ethereum-based)
  primaryWallet: string | null
  primaryWalletType: 'metamask' | '1inch' | 'phantom' | 'coinbase' | 'petra' | 'pontem' | 'martian' | null
  
  // Derived addresses
  ethereumAddress: string | null
  aptosAddress: string | null
  
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

interface CrossChainWalletContextType extends CrossChainWalletState {
  // Single connection method
  connectWallet: (walletType: 'metamask' | '1inch' | 'phantom' | 'coinbase' | 'petra' | 'pontem' | 'martian') => Promise<void>
  disconnectWallet: () => void
  
  // Utility methods
  getWalletInfo: () => { ethereumAddress: string | null; aptosAddress: string | null; walletType: string | null }
  isWalletConnected: () => boolean
}

export const CrossChainWalletContext = createContext<CrossChainWalletContextType | undefined>(undefined)

// Cross-chain wallet provider
export function CrossChainWalletProvider({ children }: { children: ReactNode }) {
  const [primaryWallet, setPrimaryWallet] = useState<string | null>(null)
  const [primaryWalletType, setPrimaryWalletType] = useState<'metamask' | '1inch' | 'phantom' | 'coinbase' | 'petra' | 'pontem' | 'martian' | null>(null)
  const [ethereumAddress, setEthereumAddress] = useState<string | null>(null)
  const [aptosAddress, setAptosAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simple hash-based derivation (fallback method)
  const deriveAptosAddress = (ethereumAddress: string): string => {
    // Simple hash-based derivation for demo purposes
    // In production, use the official Aptos derived wallet package
    const hash = ethereumAddress.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0).toString(16)
    
    return `0x${hash.padEnd(64, '0').slice(0, 64)}`
  }

  const connectWallet = async (walletType: 'metamask' | '1inch' | 'phantom' | 'coinbase' | 'petra' | 'pontem' | 'martian') => {
    console.log('Connecting to wallet:', walletType)
    setIsConnecting(true)
    setError(null)
    
    try {
      let address = ''

      // Connect to the selected wallet
      switch (walletType) {
        case 'metamask': {
          if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
          }
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
          address = accounts[0]
          break
        }

        case '1inch': {
          if (typeof window.ethereum !== 'undefined' && window.ethereum.is1inchWallet) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
            address = accounts[0]
          } else {
            throw new Error('1inch Wallet is not installed. Please install 1inch Wallet to continue.')
          }
          break
        }

        case 'phantom': {
          if (typeof window.phantom?.ethereum !== 'undefined') {
            const accounts = await window.phantom.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
            address = accounts[0]
          } else {
            throw new Error('Phantom Wallet is not installed. Please install Phantom Wallet to continue.')
          }
          break
        }

        case 'coinbase': {
          if (typeof window.ethereum !== 'undefined' && window.ethereum.providers) {
            const coinbaseProvider = window.ethereum.providers.find((p: unknown) => (p as { isCoinbaseWallet?: boolean }).isCoinbaseWallet)
            if (coinbaseProvider) {
              const accounts = await (coinbaseProvider as { request: (args: { method: string; params?: string[] }) => Promise<string[]> }).request({ method: 'eth_requestAccounts' })
              address = accounts[0]
            } else {
              throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.')
            }
          } else {
            throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.')
          }
          break
        }

        case 'petra': {
          // Check for Petra wallet
          if (typeof window.aptos !== 'undefined') {
            const accounts = await window.aptos.connect()
            address = accounts.address
          } else {
            throw new Error('Petra Wallet is not installed. Please install Petra Wallet to continue.')
          }
          break
        }

        case 'pontem': {
          // Check for Pontem wallet
          if (typeof window.pontem !== 'undefined') {
            const accounts = await window.pontem.connect()
            address = accounts.address
          } else {
            throw new Error('Pontem Wallet is not installed. Please install Pontem Wallet to continue.')
          }
          break
        }

        case 'martian': {
          // Check for Martian wallet
          if (typeof window.martian !== 'undefined') {
            const accounts = await window.martian.connect()
            address = accounts.address
          } else {
            throw new Error('Martian Wallet is not installed. Please install Martian Wallet to continue.')
          }
          break
        }

        default:
          throw new Error(`Wallet type ${walletType} is not yet supported.`)
      }

      if (!address) {
        throw new Error('Failed to get wallet address')
      }

      // Derive Aptos address from Ethereum address
      const derivedAptosAddress = deriveAptosAddress(address)

      // Set state
      setPrimaryWallet(address)
      setPrimaryWalletType(walletType)
      setEthereumAddress(address)
      setAptosAddress(derivedAptosAddress)
      setIsConnected(true)

      console.log('Cross-chain wallet connected:', {
        walletType,
        ethereumAddress: address,
        aptosAddress: derivedAptosAddress
      })

      // Listen for account changes
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts: unknown) => {
          const accountArray = accounts as string[]
          if (accountArray.length > 0) {
            const newAddress = accountArray[0]
            const newAptosAddress = deriveAptosAddress(newAddress)
            setPrimaryWallet(newAddress)
            setEthereumAddress(newAddress)
            setAptosAddress(newAptosAddress)
          } else {
            disconnectWallet()
          }
        })
      }

    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setPrimaryWallet(null)
    setPrimaryWalletType(null)
    setEthereumAddress(null)
    setAptosAddress(null)
    setIsConnected(false)
    setError(null)
    console.log('Cross-chain wallet disconnected')
  }

  const getWalletInfo = () => ({
    ethereumAddress,
    aptosAddress,
    walletType: primaryWalletType
  })

  const isWalletConnected = () => isConnected

  const value: CrossChainWalletContextType = {
    primaryWallet,
    primaryWalletType,
    ethereumAddress,
    aptosAddress,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    getWalletInfo,
    isWalletConnected
  }

  return (
    <CrossChainWalletContext.Provider value={value}>
      {children}
    </CrossChainWalletContext.Provider>
  )
}



// Type declarations for wallet providers
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: string[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
      is1inchWallet?: boolean
      providers?: unknown[]
    }
    phantom?: {
      ethereum?: {
        request: (args: { method: string; params?: string[] }) => Promise<unknown>
        on: (event: string, callback: (...args: unknown[]) => void) => void
        removeListener: (event: string, callback: (...args: unknown[]) => void) => void
      }
    }
    aptos?: {
      connect: () => Promise<{ address: string }>
    }
    pontem?: {
      connect: () => Promise<{ address: string }>
    }
    martian?: {
      connect: () => Promise<{ address: string }>
    }
  }
} 