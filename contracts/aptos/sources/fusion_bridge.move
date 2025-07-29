module fusion_bridge::bridge {
    use std::signer;
    use std::timestamp;
    use aptos_framework::event;

    /// Errors
    const ENOT_AUTHORIZED: u64 = 1;
    const EHASHLOCK_ALREADY_USED: u64 = 2;
    const ETIMELOCK_EXPIRED: u64 = 3;
    const ESWAP_ALREADY_COMPLETED: u64 = 4;
    const ESWAP_ALREADY_REFUNDED: u64 = 5;
    const EINSUFFICIENT_BALANCE: u64 = 6;

    #[event]
    struct SwapInitiatedEvent has drop, store {
        sender: address,
        recipient: address,
        amount: u64,
        hashlock: vector<u8>,
        timelock: u64,
    }

    #[event]
    struct SwapCompletedEvent has drop, store {
        hashlock: vector<u8>,
        recipient: address,
        amount: u64,
    }

    #[event]
    struct SwapRefundedEvent has drop, store {
        hashlock: vector<u8>,
        sender: address,
    }

    struct SwapRequest has store {
        sender: address,
        recipient: address,
        amount: u64,
        timelock: u64,
        completed: bool,
        refunded: bool,
    }

    struct BridgeStorage has key {
        swap_requests: std::table::Table<vector<u8>, SwapRequest>,
        used_hashlocks: std::table::Table<vector<u8>, bool>,
    }

    fun init_module(account: &signer) {
        move_to(account, BridgeStorage {
            swap_requests: std::table::new(),
            used_hashlocks: std::table::new(),
        });
    }

    #[test_only]
    public fun test_init(account: &signer) {
        move_to(account, BridgeStorage {
            swap_requests: std::table::new(),
            used_hashlocks: std::table::new(),
        });
    }

    public fun initiate_swap(
        sender: &signer,
        recipient: address,
        amount: u64,
        hashlock: vector<u8>,
        timelock: u64,
    ) acquires BridgeStorage {
        let sender_addr = signer::address_of(sender);
        let storage = borrow_global_mut<BridgeStorage>(@fusion_bridge);

        // Validate inputs
        assert!(!std::table::contains(&storage.used_hashlocks, hashlock), EHASHLOCK_ALREADY_USED);
        
        // Only check timelock if it's not zero (testing mode)
        if (timelock > 0) {
            let current_time = timestamp::now_seconds();
            assert!(timelock > current_time, ETIMELOCK_EXPIRED);
        };

        // Mark hashlock as used
        std::table::add(&mut storage.used_hashlocks, hashlock, true);

        // Create swap request
        let swap_request = SwapRequest {
            sender: sender_addr,
            recipient,
            amount,
            timelock,
            completed: false,
            refunded: false,
        };

        std::table::add(&mut storage.swap_requests, hashlock, swap_request);

        // Emit event
        event::emit(
            SwapInitiatedEvent {
                sender: sender_addr,
                recipient,
                amount,
                hashlock,
                timelock,
            }
        );
    }

    public fun complete_swap(
        sender: &signer,
        hashlock: vector<u8>,
    ) acquires BridgeStorage {
        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == @fusion_bridge, ENOT_AUTHORIZED);

        let storage = borrow_global_mut<BridgeStorage>(@fusion_bridge);
        let swap_request = std::table::borrow_mut(&mut storage.swap_requests, hashlock);
        assert!(!swap_request.completed, ESWAP_ALREADY_COMPLETED);
        assert!(!swap_request.refunded, ESWAP_ALREADY_REFUNDED);
        assert!(timestamp::now_seconds() <= swap_request.timelock, ETIMELOCK_EXPIRED);

        swap_request.completed = true;

        // Emit event
        event::emit(
            SwapCompletedEvent {
                hashlock,
                recipient: swap_request.recipient,
                amount: swap_request.amount,
            }
        );
    }

    public fun refund_swap(
        _sender: &signer,
        hashlock: vector<u8>,
    ) acquires BridgeStorage {
        let storage = borrow_global_mut<BridgeStorage>(@fusion_bridge);
        let swap_request = std::table::borrow_mut(&mut storage.swap_requests, hashlock);
        
        assert!(!swap_request.completed, ESWAP_ALREADY_COMPLETED);
        assert!(!swap_request.refunded, ESWAP_ALREADY_REFUNDED);
        assert!(timestamp::now_seconds() > swap_request.timelock, ETIMELOCK_EXPIRED);

        swap_request.refunded = true;

        // Emit event
        event::emit(
            SwapRefundedEvent {
                hashlock,
                sender: swap_request.sender,
            }
        );
    }
}
