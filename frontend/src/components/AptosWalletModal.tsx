import React from 'react'
import { Button } from '@/components/ui/button'
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'

interface AptosWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AptosWalletModal({ isOpen, onClose }: AptosWalletModalProps) {
  const { wallets, connect } = useAptosWallet()

  if (!isOpen) return null

  const handleWalletSelect = async (walletName: string) => {
    try {
      console.log(`Attempting to connect to ${walletName}...`)
      // Find the wallet and connect to it
      const wallet = wallets.find(w => w.name === walletName)
      if (wallet && wallet.readyState === 'Installed') {
        await connect(wallet.name)
        onClose()
      } else {
        console.error('Wallet not available or not installed')
        alert(`Please install ${walletName} wallet extension first.`)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // Check if the error is because wallet is already connected
      if (error instanceof Error && error.message.includes('already connected')) {
        console.log('Wallet is already connected, closing modal...')
        onClose()
      } else {
        alert(`Failed to connect to ${walletName}. Please try again.`)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Select Aptos Wallet</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => handleWalletSelect(wallet.name)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3">
                  {wallet.icon && (
                    <img src={wallet.icon} alt={wallet.name} className="w-full h-full" />
                  )}
                </div>
                <span className="font-medium">{wallet.name}</span>
              </div>
              {wallet.readyState === 'Installed' ? (
                <span className="text-green-400 text-sm">Installed</span>
              ) : (
                <span className="text-red-400 text-sm">Not Installed</span>
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-sm">
            Don't have a wallet? Install one from the list above.
          </p>
        </div>
      </div>
    </div>
  )
} 