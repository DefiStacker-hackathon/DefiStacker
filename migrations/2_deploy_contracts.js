const Stacker = artifacts.require("Stacker");
const KyberAdapter = artifacts.require("KyberAdapter");

module.exports = function(deployer) {
  const gateways = {
    kyberProxy: '0x818E6FECD516Ecc3849DAf6845e3EC868087B755',
    // other gateways 
  }

  let stacker;
  deployer.deploy(Stacker)
    .then(instance => {
      stacker = instance;
    });

  deployer.deploy(KyberAdapter)
    .then(instance => {
      stacker.addAdapter(instance.address, gateways.kyberProxy);
    });
};
