import { createContext, useState, type ReactNode } from 'react'

interface CrossChainWalletState {
  // Wallet connections
  ethereumWallet: string | null
  ethereumWalletType: 'metamask' | '1inch' | 'phantom' | 'coinbase' | null
  aptosWallet: string | null
  aptosWalletType: 'petra' | 'pontem' | 'martian' | null
  
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

interface CrossChainWalletContextType extends CrossChainWalletState {
  // Connection methods
  connectWallet: (walletType: 'metamask' | '1inch' | 'phantom' | 'coinbase' | 'petra' | 'pontem' | 'martian') => Promise<void>
  disconnectWallet: () => void
  
  // Utility methods
  getWalletInfo: () => { ethereumWallet: string | null; aptosWallet: string | null; ethereumWalletType: string | null; aptosWalletType: string | null }
  isWalletConnected: () => boolean
}

export const CrossChainWalletContext = createContext<CrossChainWalletContextType | undefined>(undefined)

// Cross-chain wallet provider
export function CrossChainWalletProvider({ children }: { children: ReactNode }) {
  const [ethereumWallet, setEthereumWallet] = useState<string | null>(null)
  const [ethereumWalletType, setEthereumWalletType] = useState<'metamask' | '1inch' | 'phantom' | 'coinbase' | null>(null)
  const [aptosWallet, setAptosWallet] = useState<string | null>(null)
  const [aptosWalletType, setAptosWalletType] = useState<'petra' | 'pontem' | 'martian' | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For cross-chain bridges, we need both Ethereum and Aptos wallets
  // This is a simplified implementation - in production, you'd want proper wallet management
  const deriveAptosAddress = (_ethereumAddress: string): string => {
    // For now, we'll use a placeholder that indicates the user needs to connect their Petra wallet
    // In a real implementation, you'd prompt the user to connect their Aptos wallet separately
    return '0x0000000000000000000000000000000000000000000000000000000000000000'
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

      // Set state based on wallet type
      if (walletType === 'metamask' || walletType === '1inch' || walletType === 'phantom' || walletType === 'coinbase') {
        // Ethereum wallet
        setEthereumWallet(address)
        setEthereumWalletType(walletType)
        setIsConnected(true)
        
        console.log('Ethereum wallet connected:', {
          walletType,
          ethereumAddress: address
        })
      } else {
        // Aptos wallet
        setAptosWallet(address)
        setAptosWalletType(walletType)
        setIsConnected(true)
        
        console.log('Aptos wallet connected:', {
          walletType,
          aptosAddress: address
        })
      }

      // Listen for account changes (only for Ethereum wallets)
      if (typeof window.ethereum !== 'undefined' && (walletType === 'metamask' || walletType === '1inch' || walletType === 'phantom' || walletType === 'coinbase')) {
        window.ethereum.on('accountsChanged', (accounts: unknown) => {
          const accountArray = accounts as string[]
          if (accountArray.length > 0) {
            const newAddress = accountArray[0]
            setEthereumWallet(newAddress)
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
    setEthereumWallet(null)
    setEthereumWalletType(null)
    setAptosWallet(null)
    setAptosWalletType(null)
    setIsConnected(false)
    setError(null)
    console.log('Cross-chain wallet disconnected')
  }

  const getWalletInfo = () => ({
    ethereumWallet,
    aptosWallet,
    ethereumWalletType,
    aptosWalletType
  })

  const isWalletConnected = () => isConnected

  const value: CrossChainWalletContextType = {
    ethereumWallet,
    ethereumWalletType,
    aptosWallet,
    aptosWalletType,
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