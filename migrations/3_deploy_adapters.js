const Stacker = artifacts.require("Stacker");
const AaveAdapter = artifacts.require("AaveAdapter");
const KyberAdapter = artifacts.require("KyberAdapter");
const UniswapAdapter = artifacts.require("UniswapAdapter");

const { GATEWAY_ADDRESSES } = require('../utils/constants');

module.exports = function(deployer) {
  // Sends some eth for gas to use in flash loan txs
  deployer.deploy(AaveAdapter, Stacker.address);
  deployer.deploy(KyberAdapter);
  deployer.deploy(UniswapAdapter);
};
