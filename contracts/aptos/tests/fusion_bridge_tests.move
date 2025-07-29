#[test_only]
module fusion_bridge::bridge_tests {
    use std::signer;
    use std::hash;
    use std::timestamp;
    use aptos_framework::account;
    use fusion_bridge::bridge;

    #[test]
    fun test_initiate_swap() {
        let admin = account::create_account_for_test(@fusion_bridge);
        let user = account::create_account_for_test(@0x123);
        
        // Initialize the module
        bridge::init_module(&admin);
        
        // Create test data
        let recipient = @0x456;
        let amount = 1000;
        let hashlock = b"test_hashlock";
        let timelock = timestamp::now_seconds() + 3600; // 1 hour from now
        
        // Initiate swap
        bridge::initiate_swap(&user, recipient, amount, hashlock, timelock);
        
        // Test passes if no error is thrown
    }
}
