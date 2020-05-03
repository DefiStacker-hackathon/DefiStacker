const Stacker = artifacts.require("Stacker");
const KyberAdapter = artifacts.require("KyberAdapter");

contract("Stacker", accounts => {
  const registeredAdapters = [
    { adapter: KyberAdapter.address, gateway: '0x818E6FECD516Ecc3849DAf6845e3EC868087B755' }
  ];

  it("should be initialized with adapters", async () => {
    let instance = await Stacker.deployed();
    for (const r of registeredAdapters) {
      const gateway = await instance.adapterToGateway.call(r.adapter);
      assert.equal(r.gateway, gateway);
    }
  });
});
