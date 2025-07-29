// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title FusionBridge
 * @dev Cross-chain bridge enabling 1inch Fusion+ swaps between Ethereum and Aptos
 * @dev Integrates with 1inch Fusion+ for MEV protection and limit orders
 */
contract FusionBridge is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event SwapInitiated(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        bytes32 indexed hashlock,
        uint256 timelock,
        string targetChain
    );

    event SwapCompleted(
        bytes32 indexed hashlock,
        address indexed recipient,
        uint256 amount
    );

    event SwapRefunded(
        bytes32 indexed hashlock,
        address indexed sender
    );

    event CrossChainMessageSent(
        bytes32 indexed hashlock,
        string targetChain,
        bytes message
    );

    // State variables
    mapping(bytes32 => bool) public hashlockUsed;
    mapping(bytes32 => SwapRequest) public swapRequests;
    mapping(string => bool) public supportedChains;
    
    // 1inch Fusion+ integration
    address public fusionResolver;
    uint256 public bridgeFee = 10; // 0.1% fee (10 basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    struct SwapRequest {
        address sender;
        address recipient;
        uint256 amount;
        uint256 timelock;
        bool completed;
        bool refunded;
        string targetChain;
    }

    // Modifiers
    modifier onlySupportedChain(string memory chain) {
        require(supportedChains[chain], "Chain not supported");
        _;
    }

    modifier onlyValidHashlock(bytes32 hashlock) {
        require(!hashlockUsed[hashlock], "Hashlock already used");
        _;
    }

    modifier onlyValidTimelock(uint256 timelock) {
        require(timelock > block.timestamp, "Timelock must be in future");
        require(timelock <= block.timestamp + 24 hours, "Timelock too far in future");
        _;
    }

    modifier onlyValidAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= 1000 ether, "Amount exceeds maximum limit");
        _;
    }

    modifier onlyValidRecipient(address recipient) {
        require(recipient != address(0), "Invalid recipient address");
        _;
    }

    constructor(address _fusionResolver) Ownable(msg.sender) {
        fusionResolver = _fusionResolver;
        
        // Initialize supported chains
        supportedChains["aptos"] = true;
        supportedChains["ethereum"] = true;
    }

    /**
     * @dev Initiate a cross-chain swap with 1inch Fusion+ integration
     * @param recipient The recipient address on the target chain
     * @param amount The amount to swap
     * @param hashlock The hashlock for atomic swap
     * @param timelock The timelock deadline
     * @param targetChain The target blockchain (e.g., "aptos")
     */
    function initiateSwap(
        address recipient,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock,
        string memory targetChain
    ) external payable nonReentrant whenNotPaused 
        onlySupportedChain(targetChain)
        onlyValidHashlock(hashlock)
        onlyValidTimelock(timelock)
        onlyValidAmount(amount)
        onlyValidRecipient(recipient) {
        
        require(msg.value == amount, "Incorrect amount sent");
        
        // Calculate and collect bridge fee
        uint256 fee = (amount * bridgeFee) / FEE_DENOMINATOR;
        uint256 netAmount = amount - fee;
        
        // Mark hashlock as used
        hashlockUsed[hashlock] = true;
        
        // Create swap request
        swapRequests[hashlock] = SwapRequest({
            sender: msg.sender,
            recipient: recipient,
            amount: netAmount,
            timelock: timelock,
            completed: false,
            refunded: false,
            targetChain: targetChain
        });

        // Emit events
        emit SwapInitiated(msg.sender, recipient, netAmount, hashlock, timelock, targetChain);
        
        // Send cross-chain message (this would integrate with a cross-chain protocol)
        bytes memory message = abi.encode(
            "INITIATE_SWAP",
            recipient,
            netAmount,
            hashlock,
            timelock
        );
        emit CrossChainMessageSent(hashlock, targetChain, message);
    }

    /**
     * @dev Complete a swap (called by relayer or cross-chain protocol)
     * @param hashlock The hashlock of the swap to complete
     */
    function completeSwap(bytes32 hashlock) external onlyOwner {
        SwapRequest storage request = swapRequests[hashlock];
        require(!request.completed, "Swap already completed");
        require(!request.refunded, "Swap was refunded");
        require(block.timestamp <= request.timelock, "Timelock expired");

        request.completed = true;
        
        // Transfer funds to recipient
        (bool success, ) = request.recipient.call{value: request.amount}("");
        require(success, "Transfer failed");

        emit SwapCompleted(hashlock, request.recipient, request.amount);
    }

    /**
     * @dev Refund a swap if timelock expires
     * @param hashlock The hashlock of the swap to refund
     */
    function refundSwap(bytes32 hashlock) external {
        SwapRequest storage request = swapRequests[hashlock];
        require(!request.completed, "Swap already completed");
        require(!request.refunded, "Swap already refunded");
        require(block.timestamp > request.timelock, "Timelock not expired");

        request.refunded = true;
        
        // Refund to sender
        (bool success, ) = request.sender.call{value: request.amount}("");
        require(success, "Refund failed");

        emit SwapRefunded(hashlock, request.sender);
    }

    /**
     * @dev Execute a 1inch Fusion+ swap
     * @param order The Fusion+ order data
     * @param signature The order signature
     */
    function executeFusionSwap(
        bytes calldata order,
        bytes calldata signature
    ) external onlyOwner {
        // This would integrate with 1inch Fusion+ resolver
        // For now, we'll emit an event to show the integration point
        emit CrossChainMessageSent(
            keccak256(order),
            "fusion_plus",
            abi.encode(order, signature)
        );
    }

    /**
     * @dev Set the 1inch Fusion+ resolver address
     * @param _fusionResolver The new resolver address
     */
    function setFusionResolver(address _fusionResolver) external onlyOwner {
        fusionResolver = _fusionResolver;
    }

    /**
     * @dev Set bridge fee
     * @param _bridgeFee The new fee in basis points
     */
    function setBridgeFee(uint256 _bridgeFee) external onlyOwner {
        require(_bridgeFee <= 100, "Fee cannot exceed 1%");
        bridgeFee = _bridgeFee;
    }

    /**
     * @dev Add or remove supported chains
     * @param chain The chain identifier
     * @param supported Whether the chain is supported
     */
    function setSupportedChain(string memory chain, bool supported) external onlyOwner {
        supportedChains[chain] = supported;
    }

    /**
     * @dev Pause the bridge
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the bridge
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get swap request details
     * @param hashlock The hashlock to query
     */
    function getSwapRequest(bytes32 hashlock) external view returns (
        address sender,
        address recipient,
        uint256 amount,
        uint256 timelock,
        bool completed,
        bool refunded,
        string memory targetChain
    ) {
        SwapRequest storage request = swapRequests[hashlock];
        return (
            request.sender,
            request.recipient,
            request.amount,
            request.timelock,
            request.completed,
            request.refunded,
            request.targetChain
        );
    }

    /**
     * @dev Check if a hashlock is used
     * @param hashlock The hashlock to check
     */
    function isHashlockUsed(bytes32 hashlock) external view returns (bool) {
        return hashlockUsed[hashlock];
    }

    /**
     * @dev Get bridge fee
     */
    function getBridgeFee() external view returns (uint256) {
        return bridgeFee;
    }

    /**
     * @dev Get Fusion+ resolver address
     */
    function getFusionResolver() external view returns (address) {
        return fusionResolver;
    }

    /**
     * @dev Check if a chain is supported
     * @param chain The chain identifier
     */
    function isChainSupported(string memory chain) external view returns (bool) {
        return supportedChains[chain];
    }

    // Emergency functions
    receive() external payable {
        // Allow contract to receive ETH
    }

    fallback() external payable {
        // Allow contract to receive ETH
    }
}