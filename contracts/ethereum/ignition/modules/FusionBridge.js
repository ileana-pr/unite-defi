// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("FusionBridgeModule", (m) => {
  // For now, we'll use a placeholder address for the Fusion+ resolver
  // In production, this would be the actual 1inch Fusion+ resolver address
  const fusionResolverAddress = m.getParameter("fusionResolverAddress", "0x0000000000000000000000000000000000000000");

  const fusionBridge = m.contract("FusionBridge", [fusionResolverAddress], {
    gas: 15000000 // Set much higher gas limit for mainnet deployment
  });

  return { fusionBridge };
}); 