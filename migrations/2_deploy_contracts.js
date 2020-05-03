const Stacker = artifacts.require("Stacker");
const KyberAdapter = artifacts.require("KyberAdapter");
const UniswapAdapter = artifacts.require("UniswapAdapter");

const { GATEWAY_ADDRESSES } = require('../utils/constants');

module.exports = function(deployer) {
  let stacker;
  deployer.deploy(Stacker)
    .then(instance => {
      stacker = instance;
    });

  deployer.deploy(KyberAdapter)
    .then(instance => {
      stacker.addAdapter(instance.address, GATEWAY_ADDRESSES.KYBER);
    });

  deployer.deploy(UniswapAdapter)
    .then(instance => {
      stacker.addAdapter(instance.address, GATEWAY_ADDRESSES.UNISWAP);
    });
};
