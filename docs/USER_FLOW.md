# User Flow Map - 1inch Aptos Cross-Chain Bridge

## 🎯 **Overview**
This document maps the complete user journey through the cross-chain bridge application, showing how users interact with the system from initial landing to successful swap completion.

## 🗺️ **Complete User Journey**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LANDING PAGE                                   │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   Hero Section  │  │  Features List  │  │   CTA Button    │            │
│  │                 │  │                 │  │                 │            │
│  │ "Bridge ETH ↔   │  │ • Atomic Swaps  │  │ "Start Bridging"│            │
│  │  APT with 1inch"│  │ • MEV Protection│  │                 │            │
│  │                 │  │ • Fast & Secure │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                    │                                       │
│                                    ▼                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SWAP PAGE                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        NAVIGATION BAR                               │   │
│  │                                                                     │   │
│  │  [1inch Aptos Bridge]                    [Connect Cross-Chain Wallet] │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WALLET CONNECTION FLOW                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    WALLET SELECTOR MODAL                            │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  MetaMask   │  │   1inch     │  │   Phantom   │  │  Coinbase   │ │   │
│  │  │             │  │             │  │             │  │             │ │   │
│  │  │ Ethereum    │  │ DeFi Wallet │  │ Multi-Chain │  │ Exchange    │ │   │
│  │  │ Wallet      │  │             │  │             │  │ Wallet      │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    [Cancel]                                    │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WALLET CONNECTED STATE                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        NAVIGATION BAR                               │   │
│  │                                                                     │   │
│  │  [1inch Aptos Bridge]  Connected: MetaMask  ETH: 0x1234...5678     │   │
│  │                                    APT: 0xabcd...efgh  [Disconnect] │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SWAP INTERFACE                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        SWAP FORM                                     │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │ FROM: [ETH ▼]  Amount: [0.1]                                   │ │   │
│  │  │                                                                 │ │   │
│  │  │                    [🔄]                                         │ │   │
│  │  │                                                                 │ │   │
│  │  │ TO:   [APT ▼]  You'll Receive: [0.0]                           │ │   │
│  │  │                                                                 │ │   │
│  │  │                    [Bridge Assets]                              │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            QUOTE FETCHING                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        QUOTE DETAILS                                │   │
│  │                                                                     │   │
│  │  Exchange Rate: 1 ETH = 1,234.56 APT                               │   │
│  │  Bridge Fee: 0.001 ETH                                             │   │
│  │  Estimated Time: 2-5 minutes                                       │   │
│  │                                                                     │   │
│  │  Route:                                                             │   │
│  │  • Ethereum: Initiate atomic swap                                  │   │
│  │  • Bridge: Cross-chain transfer                                    │   │
│  │  • Aptos: Complete swap                                            │   │
│  │                                                                     │   │
│  │  You'll Receive: 123.456 APT                                       │   │
│  │                                                                     │   │
│  │                    [Bridge Assets]                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SWAP EXECUTION                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        TRANSACTION FLOW                             │   │
│  │                                                                     │   │
│  │  1. User clicks "Bridge Assets"                                     │   │
│  │  2. MetaMask popup appears                                          │   │
│  │  3. User approves transaction                                       │   │
│  │  4. Transaction submitted to Ethereum                               │   │
│  │  5. Atomic swap initiated with hashlock/timelock                    │   │
│  │  6. Cross-chain bridge processes transfer                           │   │
│  │  7. Aptos transaction executed                                      │   │
│  │  8. Swap completed atomically                                       │   │
│  │                                                                     │   │
│  │  Status: [🔄 Bridging...]                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SUCCESS STATE                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        SUCCESS MESSAGE                              │   │
│  │                                                                     │   │
│  │  ✅ Bridge transaction completed successfully!                      │   │
│  │                                                                     │   │
│  │  Transaction Details:                                               │   │
│  │  • Ethereum TX: 0x1234...5678                                      │   │
│  │  • Aptos TX: 0xabcd...efgh                                         │   │
│  │  • Amount: 0.1 ETH → 123.456 APT                                   │   │
│  │  • Time: 3 minutes 24 seconds                                      │   │
│  │                                                                     │   │
│  │  [View on Explorer]  [Share Transaction]  [New Swap]                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 **Detailed Flow Steps**

### **1. Landing Page Experience**
- **Entry Point**: User arrives at landing page
- **Value Proposition**: Clear messaging about cross-chain bridging
- **Features Highlight**: Atomic swaps, MEV protection, speed
- **Call to Action**: "Start Bridging" button

### **2. Wallet Connection**
- **Bidirectional Support**: User connects either Ethereum wallet (MetaMask, 1inch, etc.) OR Aptos wallet (Petra, Pontem, etc.)
- **Cross-Chain Derivation**: System automatically derives the opposite chain address
- **Address Display**: Shows both ETH and APT addresses regardless of which wallet was used
- **Connection Status**: Clear indication of connected state and wallet type

### **3. Swap Interface**
- **Token Selection**: Choose from/to tokens (ETH, APT, USDC, etc.)
- **Amount Input**: Enter amount to swap
- **Real-time Quote**: Automatic quote fetching as user types
- **Route Display**: Shows the cross-chain route

### **4. Quote & Execution**
- **Quote Details**: Exchange rate, fees, estimated time
- **Route Information**: Step-by-step breakdown
- **Execution**: Single-click atomic swap
- **Transaction Flow**: MetaMask approval → Ethereum → Bridge → Aptos

### **5. Success & Completion**
- **Success Message**: Clear confirmation of completion
- **Transaction Details**: Links to both chain explorers
- **Next Actions**: Options to share, view details, or start new swap

## 🎯 **Key User Experience Features**

### **Simplicity**
- **One Wallet**: Connect single wallet (Ethereum OR Aptos) for both chains
- **Bidirectional**: Swap ETH→APT or APT→ETH seamlessly
- **One Click**: Execute cross-chain swap with single button
- **Clear Status**: Always know what's happening

### **Transparency**
- **Real-time Quotes**: See rates before executing
- **Route Details**: Understand the process
- **Transaction Tracking**: Follow progress on both chains

### **Security**
- **Atomic Swaps**: All-or-nothing transactions
- **MEV Protection**: Protected from front-running
- **Hashlock/Timelock**: Secure cross-chain coordination

### **Speed**
- **Fast Quotes**: Instant rate fetching
- **Quick Execution**: Optimized transaction flow
- **Real-time Updates**: Live status updates

## 🚀 **Error Handling & Edge Cases**

### **Connection Issues**
- **Wallet Not Found**: Clear instructions to install wallet
- **Network Mismatch**: Guide to switch to correct network
- **Connection Failed**: Retry options and troubleshooting

### **Transaction Issues**
- **Insufficient Balance**: Clear error message with required amount
- **Gas Issues**: Automatic gas estimation and warnings
- **Failed Transactions**: Clear error messages and recovery options

### **Quote Issues**
- **No Liquidity**: Inform user and suggest alternatives
- **Rate Changes**: Warn about slippage and allow confirmation
- **Timeout**: Auto-refresh quotes and retry options

## 📊 **Success Metrics**

### **User Experience**
- **Time to Connect**: <30 seconds
- **Time to Quote**: <2 seconds
- **Time to Execute**: <5 minutes
- **Success Rate**: >99.9%

### **User Satisfaction**
- **Completion Rate**: >95% of users who start complete swap
- **Return Rate**: >80% of users return for additional swaps
- **Error Rate**: <0.1% failed transactions

## 🎨 **Design Principles**

### **Clarity**
- **Clear Labels**: Every element has clear purpose
- **Progressive Disclosure**: Show details when needed
- **Consistent Language**: Use familiar DeFi terminology

### **Confidence**
- **Status Indicators**: Always show current state
- **Confirmation Steps**: Clear approval processes
- **Success Feedback**: Celebrate completed transactions

### **Control**
- **User Choice**: Allow cancellation at any step
- **Information Access**: Provide transaction details
- **Error Recovery**: Clear paths to fix issues

---

*This user flow ensures a seamless, professional experience that makes cross-chain bridging as simple as a regular token swap while maintaining the security and transparency users expect from DeFi applications.* 