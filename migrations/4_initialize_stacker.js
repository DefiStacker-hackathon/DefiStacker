const Stacker = artifacts.require("Stacker");
const AaveAdapter = artifacts.require("AaveAdapter");
const CompoundAdapter = artifacts.require("CompoundAdapter");
const KyberAdapter = artifacts.require("KyberAdapter");
const UniswapAdapter = artifacts.require("UniswapAdapter");

const { EMPTY_ADDRESS, GATEWAY_ADDRESSES } = require('../utils/constants');

module.exports = function(deployer) {
  let stacker;
  deployer
    .then(() => Stacker.deployed())
    .then(instance => {
      stacker = instance;

      stacker.addAdapter(AaveAdapter.address, GATEWAY_ADDRESSES.AAVE);
      stacker.addAdapter(CompoundAdapter.address, EMPTY_ADDRESS);
      stacker.addAdapter(KyberAdapter.address, GATEWAY_ADDRESSES.KYBER);
      stacker.addAdapter(UniswapAdapter.address, GATEWAY_ADDRESSES.UNISWAP);
    });
};
