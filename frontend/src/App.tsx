import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import LandingPage from './pages/LandingPage'
import SwapPage from './pages/SwapPage'
import './index.css'

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/swap" element={<SwapPage />} />
        </Routes>
      </Router>
    </WalletProvider>
  )
}

export default App
