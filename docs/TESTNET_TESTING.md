# Testnet Testing Guide - Bidirectional Cross-Chain Swaps

## 🎯 **Overview**

This guide shows you how to test bidirectional cross-chain swaps using **Sepolia testnet ETH** and **Aptos testnet APT** tokens. This allows you to test both directions without spending real money.

## 🧪 **Testnet Setup**

### **1. Environment Configuration**

Your `.env` file should include:

```bash
# Testnet Configuration
NETWORK=testnet
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
APTOS_TESTNET_URL=https://fullnode.testnet.aptoslabs.com/v1
PRIVATE_KEY=your_sepolia_private_key
APTOS_PRIVATE_KEY=your_aptos_private_key
FUSION_API_KEY=your_1inch_fusion_api_key
```

### **2. Get Free Testnet Tokens**

#### **Sepolia Testnet (Ethereum)**
```bash
# Free ETH faucets:
1. https://sepoliafaucet.com/ (Alchemy) - 0.5 ETH
2. https://faucet.sepolia.dev/ (Chainlink) - 0.1 ETH  
3. https://sepolia-faucet.pk910.de/ (PoW) - 0.5 ETH

# Get your Sepolia address:
- Connect MetaMask to Sepolia testnet
- Copy your wallet address
- Request tokens from faucets
```

#### **Aptos Testnet**
```bash
# Free APT faucets:
1. https://aptoslabs.com/testnet-faucet - 1000 APT
2. https://test-token-faucet.vercel.app/ - Additional tokens

# Get your Aptos address:
- Install Petra wallet
- Switch to testnet
- Copy your wallet address
- Request tokens from faucet
```

## 🔄 **Testing Bidirectional Swaps**

### **Test 1: ETH → APT Swap**

**Prerequisites:**
- ✅ Sepolia ETH in MetaMask
- ✅ MetaMask connected to Sepolia testnet
- ✅ Backend running with testnet configuration

**Steps:**
1. **Start the application:**
   ```bash
   cd backend && npm start
   cd frontend && npm run dev
   ```

2. **Connect MetaMask:**
   - Go to http://localhost:5173/swap
   - Click "Connect Cross-Chain Wallet"
   - Select "MetaMask"
   - Approve connection

3. **Configure Swap:**
   - **From**: ETH (Sepolia)
   - **To**: APT (Aptos)
   - **Amount**: 0.01 ETH (small test amount)

4. **Execute Swap:**
   - Review quote details
   - Click "Bridge Assets"
   - Approve transaction in MetaMask
   - Wait for confirmation

**Expected Result:**
- ✅ ETH deducted from Sepolia wallet
- ✅ APT received in derived Aptos address
- ✅ Transaction hash visible in both networks

### **Test 2: APT → ETH Swap**

**Prerequisites:**
- ✅ Aptos testnet APT in Petra wallet
- ✅ Petra wallet connected to testnet
- ✅ Backend running with testnet configuration

**Steps:**
1. **Connect Petra Wallet:**
   - Go to http://localhost:5173/swap
   - Click "Connect Cross-Chain Wallet"
   - Select "Petra"
   - Approve connection

2. **Configure Swap:**
   - **From**: APT (Aptos)
   - **To**: ETH (Sepolia)
   - **Amount**: 10 APT (small test amount)

3. **Execute Swap:**
   - Review quote details
   - Click "Bridge Assets"
   - Approve transaction in Petra
   - Wait for confirmation

**Expected Result:**
- ✅ APT deducted from Aptos wallet
- ✅ ETH received in derived Ethereum address
- ✅ Transaction hash visible in both networks

## 🎯 **Test Scenarios**

### **Scenario 1: Small Amount Test**
```bash
# Test with minimal amounts
ETH → APT: 0.001 ETH
APT → ETH: 1 APT
```

### **Scenario 2: Medium Amount Test**
```bash
# Test with moderate amounts
ETH → APT: 0.01 ETH
APT → ETH: 10 APT
```

### **Scenario 3: Error Handling Test**
```bash
# Test insufficient balance
- Try swapping more than you have
- Verify proper error messages
- Test network disconnection
```

### **Scenario 4: Multiple Wallet Test**
```bash
# Test different wallet types
- MetaMask → Petra
- 1inch → Pontem
- Phantom → Martian
```

## 📊 **Monitoring & Verification**

### **1. Transaction Tracking**

**Ethereum (Sepolia):**
- Use https://sepolia.etherscan.io/
- Search by transaction hash
- Verify gas usage and status

**Aptos:**
- Use https://explorer.aptoslabs.com/account/[address]?network=testnet
- Check account balance changes
- Verify transaction details

### **2. Balance Verification**

**Before Swap:**
```bash
# Record initial balances
Sepolia ETH: 0.5 ETH
Aptos APT: 1000 APT
```

**After Swap:**
```bash
# Verify balance changes
Sepolia ETH: 0.49 ETH (0.01 deducted)
Aptos APT: 1010 APT (10 received)
```

### **3. Cross-Chain Address Verification**

**Check Derived Addresses:**
```bash
# Your app should show:
Ethereum Address: 0x1234...5678
Aptos Address: 0xabcd...efgh (derived)

# Verify both addresses are consistent
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Insufficient Balance"**
```bash
# Solution:
1. Check faucet balance
2. Wait for transaction confirmation
3. Refresh wallet connection
```

### **Issue 2: "Network Mismatch"**
```bash
# Solution:
1. Ensure MetaMask is on Sepolia
2. Ensure Petra is on testnet
3. Check RPC URL configuration
```

### **Issue 3: "Transaction Failed"**
```bash
# Solution:
1. Check gas fees
2. Verify private key configuration
3. Check backend logs for errors
```

### **Issue 4: "Quote Not Available"**
```bash
# Solution:
1. Check 1inch Fusion+ API key
2. Verify testnet liquidity
3. Try smaller amounts
```

## 🎯 **Success Criteria**

### **Technical Success:**
- ✅ Transactions execute successfully
- ✅ Cross-chain address derivation works
- ✅ Balance updates correctly
- ✅ Error handling works properly

### **User Experience Success:**
- ✅ Single wallet connection works
- ✅ Bidirectional swaps function
- ✅ Real-time status updates
- ✅ Clear error messages

### **Performance Success:**
- ✅ Quote fetching < 2 seconds
- ✅ Transaction execution < 5 minutes
- ✅ Success rate > 95%
- ✅ No critical errors

## 🔧 **Troubleshooting Commands**

### **Check Backend Status:**
```bash
curl http://localhost:3001/health
```

### **Check Network Configuration:**
```bash
curl -X POST http://localhost:3001/api/switch-network \
  -H 'Content-Type: application/json' \
  -d '{"network":"testnet"}'
```

### **Test Token Service:**
```bash
curl http://localhost:3001/api/tokens
```

### **Check Wallet Connection:**
```bash
curl -X POST http://localhost:3001/api/wallet/connect \
  -H 'Content-Type: application/json' \
  -d '{"walletAddress":"0x...","walletType":"metamask","chain":"ethereum"}'
```

## 📈 **Next Steps**

After successful testnet testing:

1. **Deploy Smart Contracts** to testnets
2. **Test with Real Liquidity** on testnets
3. **Performance Testing** with larger amounts
4. **Security Testing** with edge cases
5. **User Acceptance Testing** with real users

---

*This testnet setup allows you to thoroughly test your bidirectional cross-chain bridge without any financial risk while ensuring all functionality works correctly before mainnet deployment.* 