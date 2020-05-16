const Stacker = artifacts.require("Stacker");
const AaveAdapter = artifacts.require("AaveAdapter");
const KyberAdapter = artifacts.require("KyberAdapter");
const UniswapAdapter = artifacts.require("UniswapAdapter");

const { GATEWAY_ADDRESSES } = require('../utils/constants');

module.exports = function(deployer) {
  let stacker;
  deployer
    .then(() => Stacker.deployed())
    .then(instance => {
      stacker = instance;

      stacker.addAdapter(AaveAdapter.address, GATEWAY_ADDRESSES.AAVE);
      stacker.addAdapter(KyberAdapter.address, GATEWAY_ADDRESSES.KYBER);
      stacker.addAdapter(UniswapAdapter.address, GATEWAY_ADDRESSES.UNISWAP);
    });
};
