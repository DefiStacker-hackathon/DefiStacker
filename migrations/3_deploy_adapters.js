const Stacker = artifacts.require("Stacker");
const AaveAdapter = artifacts.require("AaveAdapter");
const CompoundAdapter = artifacts.require("CompoundAdapter");
const KyberAdapter = artifacts.require("KyberAdapter");
const UniswapAdapter = artifacts.require("UniswapAdapter");

module.exports = function(deployer) {
  // Sends some eth for gas to use in flash loan txs
  deployer.deploy(AaveAdapter, Stacker.address);
  deployer.deploy(CompoundAdapter);
  deployer.deploy(KyberAdapter);
  deployer.deploy(UniswapAdapter);
};
