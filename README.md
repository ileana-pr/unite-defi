# 🚀 AptosBridge - Cross-Chain DeFi Unification

## 📌 Summary

**One-liner**: A seamless bidirectional bridge enabling 1inch Fusion+ swaps between Ethereum and Aptos, bringing DeFi liquidity to the Aptos ecosystem while maintaining security through hashlock and timelock mechanisms.

**Introduction**: I'm a computer science major with strong OOP fundamentals, building my first blockchain project to solve real DeFi interoperability challenges.

## 😖 Pain Points / Problems

### Problem 1: Fragmented DeFi Liquidity
- Users can't access Ethereum's vast DeFi liquidity from Aptos
- Manual bridging is slow, expensive, and requires multiple transactions
- No native support for advanced DeFi features like limit orders on Aptos

### Problem 2: Security Risks in Cross-Chain Swaps
- Existing bridges often lack proper security mechanisms
- Users face counterparty risk and potential fund loss
- No atomic swap guarantees between chains

### Problem 3: Poor User Experience
- Complex multi-step processes for cross-chain operations
- High gas fees and long confirmation times
- No unified interface for cross-chain DeFi operations

## 📚 Context

### Existing Solutions and Limitations
- Current bridges (like Wormhole) only support basic token transfers
- No integration with advanced DeFi protocols like 1inch Fusion+
- Limited support for complex swap operations with security guarantees

### Why Now
- Aptos is gaining traction with its Move language and parallel execution
- 1inch Fusion+ is revolutionizing cross-chain swaps
- There is significant market demand for crosschain facilitation.

### Technical Trends
- Move language offers better security than Solidity
- Parallel execution on Aptos enables higher throughput
- Hashlock/timelock mechanisms provide atomic swap guarantees

## 🧩 Alternatives

### Alternative 1: Traditional Bridges
- **Limitation**: Only support basic token transfers, no DeFi integration
- **Why They Fail**: Can't handle complex swap logic or provide atomic guarantees

### Alternative 2: Manual Multi-Step Process
- **Limitation**: Users must bridge tokens, then swap separately
- **Why It Fails**: High fees, long delays, multiple points of failure

### Alternative 3: Centralized Solutions
- **Limitation**: Require trust in third parties
- **Why They Fail**: Counterparty risk and centralization concerns

## 🔧 Technical / Functional Requirements

### User-Facing Requirements
- Simple web interface for initiating cross-chain swaps
- Real-time status tracking of swap progress
- Support for popular tokens (ETH, USDC, USDT, etc.)
- Hashlock and timelock functionality for security

### Integration Needs
- 1inch Fusion+ API integration
- 1inch Wallet integration for seamless user experience
- Aptos Move module development
- Ethereum smart contract development
- Cross-chain message passing system

### Platform Considerations
- Web-based dApp with React frontend
- Mobile-responsive design
- **1inch Wallet integration** (primary wallet for Ethereum side)
- **Petra Wallet integration** (primary wallet for Aptos side)
- Optional MetaMask fallback for broader compatibility

### Non-Functional Requirements
- Sub-second transaction finality on Aptos
- Atomic swap guarantees
- Gas optimization for cost efficiency
- Comprehensive error handling

## 🏗️ Architecture Overview

```
User Interface (React)
    ↓
1inch Wallet (Ethereum) ←→ AptosBridge ←→ Petra Wallet (Aptos)
    ↓                        ↓                    ↓
1inch Fusion+ API      Cross-Chain Layer    Move Module
    ↓                        ↓                    ↓
Ethereum Smart Contract  Hashlock/Timelock  Aptos Token Module
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Aptos CLI
- 1inch Wallet
- Petra Wallet

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/aptosbridge.git
cd aptosbridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## 📞 Contact Info

- **GitHub**: [CheddarQueso](https://github.com/ileana-pr)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [1inch Network](https://1inch.io) for Fusion+ protocol
- [Aptos Labs](https://aptoslabs.com) for Move language and blockchain
- [ETHGlobal](https://ethglobal.com) for the hackathon opportunity