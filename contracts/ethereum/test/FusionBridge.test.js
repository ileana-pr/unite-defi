const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FusionBridge", function () {
  let fusionBridge;
  let owner;
  let user1;
  let user2;
  let fusionResolver;

  beforeEach(async function () {
    [owner, user1, user2, fusionResolver] = await ethers.getSigners();
    
    const FusionBridge = await ethers.getContractFactory("FusionBridge");
    fusionBridge = await FusionBridge.deploy(fusionResolver.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fusionBridge.owner()).to.equal(owner.address);
    });

    it("Should set the Fusion+ resolver", async function () {
      expect(await fusionBridge.fusionResolver()).to.equal(fusionResolver.address);
    });

    it("Should set default bridge fee", async function () {
      expect(await fusionBridge.bridgeFee()).to.equal(10); // 0.1%
    });

    it("Should support Ethereum and Aptos chains", async function () {
      expect(await fusionBridge.isChainSupported("ethereum")).to.be.true;
      expect(await fusionBridge.isChainSupported("aptos")).to.be.true;
    });
  });

  describe("Swap Operations", function () {
    const amount = ethers.parseEther("1.0");
    const hashlock = ethers.keccak256(ethers.toUtf8Bytes("test_hashlock"));
    const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    it("Should initiate a swap", async function () {
      await expect(
        fusionBridge.connect(user1).initiateSwap(
          user2.address,
          amount,
          hashlock,
          timelock,
          "aptos",
          { value: amount }
        )
      ).to.emit(fusionBridge, "SwapInitiated")
        .withArgs(user1.address, user2.address, amount - (amount * 10n / 10000n), hashlock, timelock, "aptos");
    });

    it("Should calculate correct fee", async function () {
      const fee = (amount * 10n) / 10000n; // 0.1% fee
      const netAmount = amount - fee;

      await fusionBridge.connect(user1).initiateSwap(
        user2.address,
        amount,
        hashlock,
        timelock,
        "aptos",
        { value: amount }
      );

      const request = await fusionBridge.getSwapRequest(hashlock);
      expect(request.amount).to.equal(netAmount);
    });

    it("Should prevent duplicate hashlock usage", async function () {
      await fusionBridge.connect(user1).initiateSwap(
        user2.address,
        amount,
        hashlock,
        timelock,
        "aptos",
        { value: amount }
      );

      await expect(
        fusionBridge.connect(user1).initiateSwap(
          user2.address,
          amount,
          hashlock,
          timelock,
          "aptos",
          { value: amount }
        )
      ).to.be.revertedWith("Hashlock already used");
    });

    it("Should prevent invalid timelock", async function () {
      const pastTimelock = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      await expect(
        fusionBridge.connect(user1).initiateSwap(
          user2.address,
          amount,
          hashlock,
          pastTimelock,
          "aptos",
          { value: amount }
        )
      ).to.be.revertedWith("Timelock must be in future");
    });

    it("Should prevent unsupported chains", async function () {
      await expect(
        fusionBridge.connect(user1).initiateSwap(
          user2.address,
          amount,
          hashlock,
          timelock,
          "unsupported_chain",
          { value: amount }
        )
      ).to.be.revertedWith("Chain not supported");
    });
  });

  describe("Swap Completion", function () {
    const amount = ethers.parseEther("1.0");
    const hashlock = ethers.keccak256(ethers.toUtf8Bytes("test_hashlock"));
    const timelock = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      await fusionBridge.connect(user1).initiateSwap(
        user2.address,
        amount,
        hashlock,
        timelock,
        "aptos",
        { value: amount }
      );
    });

    it("Should complete a swap", async function () {
      const initialBalance = await ethers.provider.getBalance(user2.address);

      await fusionBridge.connect(owner).completeSwap(hashlock);

      const finalBalance = await ethers.provider.getBalance(user2.address);
      const request = await fusionBridge.getSwapRequest(hashlock);
      
      expect(request.completed).to.be.true;
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should prevent non-owner from completing swap", async function () {
      await expect(
        fusionBridge.connect(user1).completeSwap(hashlock)
      ).to.be.revertedWithCustomError(fusionBridge, "OwnableUnauthorizedAccount");
    });

    it("Should prevent completing already completed swap", async function () {
      await fusionBridge.connect(owner).completeSwap(hashlock);

      await expect(
        fusionBridge.connect(owner).completeSwap(hashlock)
      ).to.be.revertedWith("Swap already completed");
    });
  });

  describe("Swap Refund", function () {
    const amount = ethers.parseEther("1.0");
    const hashlock = ethers.keccak256(ethers.toUtf8Bytes("test_hashlock"));
    let timelock;

    beforeEach(async function () {
      // Get current block timestamp and add 10 seconds to ensure it's in the future
      const currentBlock = await ethers.provider.getBlock("latest");
      timelock = currentBlock.timestamp + 10;

      await fusionBridge.connect(user1).initiateSwap(
        user2.address,
        amount,
        hashlock,
        timelock,
        "aptos",
        { value: amount }
      );
    });

    it("Should refund after timelock expires", async function () {
      // Wait for timelock to expire (wait 15 seconds to ensure it's expired)
      await ethers.provider.send("evm_increaseTime", [15]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await ethers.provider.getBalance(user1.address);

      await fusionBridge.connect(user1).refundSwap(hashlock);

      const finalBalance = await ethers.provider.getBalance(user1.address);
      const request = await fusionBridge.getSwapRequest(hashlock);
      
      expect(request.refunded).to.be.true;
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should prevent refund before timelock expires", async function () {
      await expect(
        fusionBridge.connect(user1).refundSwap(hashlock)
      ).to.be.revertedWith("Timelock not expired");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set bridge fee", async function () {
      await fusionBridge.connect(owner).setBridgeFee(50); // 0.5%
      expect(await fusionBridge.bridgeFee()).to.equal(50);
    });

    it("Should prevent non-owner from setting bridge fee", async function () {
      await expect(
        fusionBridge.connect(user1).setBridgeFee(50)
      ).to.be.revertedWithCustomError(fusionBridge, "OwnableUnauthorizedAccount");
    });

    it("Should prevent setting fee above 1%", async function () {
      await expect(
        fusionBridge.connect(owner).setBridgeFee(101)
      ).to.be.revertedWith("Fee cannot exceed 1%");
    });

    it("Should allow owner to set supported chains", async function () {
      await fusionBridge.connect(owner).setSupportedChain("polygon", true);
      expect(await fusionBridge.isChainSupported("polygon")).to.be.true;
    });

    it("Should allow owner to pause and unpause", async function () {
      await fusionBridge.connect(owner).pause();
      expect(await fusionBridge.paused()).to.be.true;

      await fusionBridge.connect(owner).unpause();
      expect(await fusionBridge.paused()).to.be.false;
    });
  });

  describe("1inch Fusion+ Integration", function () {
    it("Should emit Fusion+ swap event", async function () {
      const order = ethers.toUtf8Bytes("fusion_order_data");
      const signature = ethers.toUtf8Bytes("fusion_signature");

      await expect(
        fusionBridge.connect(owner).executeFusionSwap(order, signature)
      ).to.emit(fusionBridge, "CrossChainMessageSent");
    });
  });

  describe("View Functions", function () {
    it("Should return correct swap request details", async function () {
      const amount = ethers.parseEther("1.0");
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("test_hashlock"));
      const timelock = Math.floor(Date.now() / 1000) + 3600;

      await fusionBridge.connect(user1).initiateSwap(
        user2.address,
        amount,
        hashlock,
        timelock,
        "aptos",
        { value: amount }
      );

      const request = await fusionBridge.getSwapRequest(hashlock);
      expect(request.sender).to.equal(user1.address);
      expect(request.recipient).to.equal(user2.address);
      expect(request.targetChain).to.equal("aptos");
    });

    it("Should check hashlock usage correctly", async function () {
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("test_hashlock"));
      
      expect(await fusionBridge.isHashlockUsed(hashlock)).to.be.false;

      await fusionBridge.connect(user1).initiateSwap(
        user2.address,
        ethers.parseEther("1.0"),
        hashlock,
        Math.floor(Date.now() / 1000) + 3600,
        "aptos",
        { value: ethers.parseEther("1.0") }
      );

      expect(await fusionBridge.isHashlockUsed(hashlock)).to.be.true;
    });
  });
});