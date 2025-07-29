module fusion_bridge::bridge {
    use std::signer;
    use std::hash;
    use std::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;

    /// Errors
    const ENOT_AUTHORIZED: u64 = 1;
    const EHASHLOCK_ALREADY_USED: u64 = 2;
    const ETIMELOCK_EXPIRED: u64 = 3;
    const ESWAP_ALREADY_COMPLETED: u64 = 4;
    const ESWAP_ALREADY_REFUNDED: u64 = 5;
    const EINSUFFICIENT_BALANCE: u64 = 6;

    /// Events
    struct SwapInitiatedEvent has drop, store {
        sender: address,
        recipient: address,
        amount: u64,
        hashlock: vector<u8>,
        timelock: u64,
    }

    struct SwapCompletedEvent has drop, store {
        hashlock: vector<u8>,
        recipient: address,
        amount: u64,
    }

    struct SwapRefundedEvent has drop, store {
        hashlock: vector<u8>,
        sender: address,
    }

    /// Resources
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

    /// Functions
    public fun init_module(account: &signer) {
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
    ) {
        let sender_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();

        // Validate inputs
        assert!(!std::table::contains(&get_bridge_storage().used_hashlocks, hashlock), EHASHLOCK_ALREADY_USED);
        assert!(timelock > current_time, ETIMELOCK_EXPIRED);

        // Mark hashlock as used
        std::table::add(&mut get_bridge_storage().used_hashlocks, hashlock, true);

        // Create swap request
        let swap_request = SwapRequest {
            sender: sender_addr,
            recipient,
            amount,
            timelock,
            completed: false,
            refunded: false,
        };

        std::table::add(&mut get_bridge_storage().swap_requests, hashlock, swap_request);

        // Emit event
        account::emit_event(
            sender,
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
    ) {
        let sender_addr = signer::address_of(sender);
        assert!(sender_addr == @fusion_bridge, ENOT_AUTHORIZED);

        let swap_request = std::table::borrow_mut(&mut get_bridge_storage().swap_requests, hashlock);
        assert!(!swap_request.completed, ESWAP_ALREADY_COMPLETED);
        assert!(!swap_request.refunded, ESWAP_ALREADY_REFUNDED);
        assert!(timestamp::now_seconds() <= swap_request.timelock, ETIMELOCK_EXPIRED);

        swap_request.completed = true;

        // Emit event
        account::emit_event(
            sender,
            SwapCompletedEvent {
                hashlock,
                recipient: swap_request.recipient,
                amount: swap_request.amount,
            }
        );
    }

    public fun refund_swap(
        sender: &signer,
        hashlock: vector<u8>,
    ) {
        let sender_addr = signer::address_of(sender);
        let swap_request = std::table::borrow_mut(&mut get_bridge_storage().swap_requests, hashlock);
        
        assert!(!swap_request.completed, ESWAP_ALREADY_COMPLETED);
        assert!(!swap_request.refunded, ESWAP_ALREADY_REFUNDED);
        assert!(timestamp::now_seconds() > swap_request.timelock, ETIMELOCK_EXPIRED);

        swap_request.refunded = true;

        // Emit event
        account::emit_event(
            sender,
            SwapRefundedEvent {
                hashlock,
                sender: swap_request.sender,
            }
        );
    }

    /// Helper functions
    fun get_bridge_storage(): &mut BridgeStorage {
        borrow_global_mut<BridgeStorage>(@fusion_bridge)
    }
}
