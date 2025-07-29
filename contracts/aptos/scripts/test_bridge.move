script {
    use std::signer;
    use fusion_bridge::bridge;

    fun main(sender: signer) {
        let sender_addr = signer::address_of(&sender);
        
        // Test data
        let recipient = sender_addr; // Send to self for testing
        let amount = 1000;
        let hashlock = b"test_hashlock_123";
        let timelock = 0; // Skip timestamp validation for testing
        
        // Try to initiate a swap
        bridge::initiate_swap(&sender, recipient, amount, hashlock, timelock);
    }
}