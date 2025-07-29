#[test_only]
module fusion_bridge::bridge_tests {
    use aptos_framework::account;
    use fusion_bridge::bridge;

    #[test]
    fun test_initiate_swap() {
        // Initialize the module
        let admin = account::create_account_for_test(@fusion_bridge);
        bridge::test_init(&admin);
        
        let user = account::create_account_for_test(@0x123);
        
        // Create test data
        let recipient = @0x456;
        let amount = 1000;
        let hashlock = b"test_hashlock";
        let timelock = 0; // Skip timestamp validation for testing
        
        // Initiate swap
        bridge::initiate_swap(&user, recipient, amount, hashlock, timelock);
        
        // Test passes if no error is thrown
    }
}
