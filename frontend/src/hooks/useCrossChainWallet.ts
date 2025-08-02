import { useContext } from 'react'
import { CrossChainWalletContext } from '@/contexts/WalletContext'

export function useCrossChainWallet() {
  const context = useContext(CrossChainWalletContext)
  if (context === undefined) {
    throw new Error('useCrossChainWallet must be used within a CrossChainWalletProvider')
  }
  return context
} 