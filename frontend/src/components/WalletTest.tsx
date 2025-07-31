import React from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WalletTest() {
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

  const connectedWallets = getConnectedWallets()
  const availableWallets = getAvailableWallets()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wallet Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Connection Status:</h3>
          <div className="text-sm space-y-1">
            <div>Ethereum: {ethereumAccount ? '✅ Connected' : '❌ Disconnected'}</div>
            <div>Aptos: {aptosAccount ? '✅ Connected' : '❌ Disconnected'}</div>
            <div>Total Wallets: {connectedWallets.length}</div>
          </div>
        </div>

        {ethereumAccount && (
          <div className="text-sm">
            <strong>Ethereum Account:</strong> {ethereumAccount}
          </div>
        )}

        {aptosAccount && (
          <div className="text-sm">
            <strong>Aptos Account:</strong> {aptosAccount}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Available Wallets:</h3>
          <div className="text-xs space-y-1">
            {availableWallets.map((wallet, index) => (
              <div key={index} className="flex justify-between">
                <span>{wallet.name}:</span>
                <span className={wallet.available ? 'text-green-400' : 'text-red-400'}>
                  {wallet.available ? '✅ Available' : '❌ Not Available'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Connect Options:</h3>
          
          {/* Simple test button */}
          <Button
            onClick={() => console.log('Test button clicked!')}
            className="w-full mb-2 bg-green-600 hover:bg-green-700 text-white"
          >
            Test Button (Check Console)
          </Button>
          
          {availableWallets.find(w => w.name === 'MetaMask')?.available && (
            <Button
              onClick={() => connectEthereum('metamask')}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          )}

          {availableWallets.find(w => w.name === '1inch Wallet')?.available && (
            <Button
              onClick={() => connectEthereum('1inch')}
              disabled={isConnecting}
              className="w-full"
              variant="outline"
            >
              {isConnecting ? 'Connecting...' : 'Connect 1inch Wallet'}
            </Button>
          )}

          <Button
            onClick={() => connectEthereum('walletconnect')}
            disabled={isConnecting}
            className="w-full"
            variant="outline"
          >
            {isConnecting ? 'Connecting...' : 'Connect WalletConnect'}
          </Button>

          <Button
            onClick={connectAptos}
            disabled={isConnecting}
            className="w-full"
            variant="outline"
          >
            {isConnecting ? 'Connecting...' : 'Connect Aptos'}
          </Button>
        </div>

        {connectedWallets.length > 0 && (
          <div className="space-y-2">
            <Button
              onClick={disconnectEthereum}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              Disconnect Ethereum
            </Button>

            <Button
              onClick={disconnectAptos}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              Disconnect Aptos
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
            Error: {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 