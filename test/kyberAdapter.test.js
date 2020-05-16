const Stacker = artifacts.require("Stacker");
const KyberAdapter = artifacts.require("KyberAdapter");
const IERC20 = artifacts.require("IERC20");

const {
  ENCODING_SCHEMAS,
  TOKEN_ADDRESSES,
  UNISWAP_DAI_EXCHANGE
} = require('../utils/constants');

contract("KyberAdapter", accounts => {
  let daiContract;

  before(async () => {
    daiContract = await IERC20.at(TOKEN_ADDRESSES.DAI);

    // Transfer DAI to the primary account
    const daiAmount = web3.utils.toWei('10000', 'ether');
    await daiContract.transfer(accounts[0], daiAmount, { from: UNISWAP_DAI_EXCHANGE });
  })

  describe('Static srcToken amounts', () => {
    it("can execute a takeOrder from ETH to token", async () => {
      const srcToken = TOKEN_ADDRESSES.ETH;
      const srcAmount = web3.utils.toWei('1', 'ether');
      const destToken = TOKEN_ADDRESSES.DAI;

      const spendAmount = srcAmount;
      const spendAsset = srcToken;
      const callAdapter = KyberAdapter.address;
      const callSig = `takeOrder(address,bytes)`;

      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.KYBER.TAKE_ORDER,
        [srcToken, srcAmount, 0, destToken],
      );

      let instance = await Stacker.deployed();
      await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs],
        { value: spendAmount }
      );

      const destTokenInterface = await IERC20.at(destToken);
      const destTokenBalance = await destTokenInterface.balanceOf.call(accounts[0]);
      assert.notEqual(destTokenBalance, web3.utils.toBN(0));
    });

    it("can execute a takeOrder from token to ETH", async () => {
      const srcToken = TOKEN_ADDRESSES.DAI;
      const srcAmount = web3.utils.toWei('100', 'ether');
      const destToken = TOKEN_ADDRESSES.ETH;
  
      const spendAmount = srcAmount;
      const spendAsset = srcToken;
      const callAdapter = KyberAdapter.address;
      const callSig = `takeOrder(address,bytes)`;
  
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.KYBER.TAKE_ORDER,
        [srcToken, srcAmount, 0, destToken],
      );
  
      const preTxEthBalance = await web3.eth.getBalance(accounts[0]);
  
      let instance = await Stacker.deployed();
      await daiContract.approve(instance.address, spendAmount);
      await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs]
      );
  
      const postTxEthBalance = await web3.eth.getBalance(accounts[0]);
      assert.notEqual(postTxEthBalance, preTxEthBalance); // TODO: better assertion with big number comparison
    });
  });

  describe('Relative srcToken amounts', () => {
    it("can execute a takeOrder from ETH to token", async () => {
      const srcToken = TOKEN_ADDRESSES.ETH;
      const srcPercentage = web3.utils.toWei('0.5', 'ether'); // 50%
      const destToken = TOKEN_ADDRESSES.DAI;

      const spendAmount = web3.utils.toWei('1', 'ether');
      const spendAsset = srcToken;
      const callAdapter = KyberAdapter.address;
      const callSig = `takeOrder(address,bytes)`;

      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.KYBER.TAKE_ORDER,
        [srcToken, 0, srcPercentage, destToken],
      );

      let instance = await Stacker.deployed();
      await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs],
        { value: spendAmount }
      );

      const destTokenInterface = await IERC20.at(destToken);
      const destTokenBalance = await destTokenInterface.balanceOf.call(accounts[0]);
      assert.notEqual(destTokenBalance, web3.utils.toBN(0));
    });

    it("can execute a takeOrder from token to ETH", async () => {
      const srcToken = TOKEN_ADDRESSES.DAI;
      const srcPercentage = web3.utils.toWei('0.5', 'ether'); // 50%
      const destToken = TOKEN_ADDRESSES.ETH;
  
      const spendAmount = web3.utils.toWei('100', 'ether');
      const spendAsset = srcToken;
      const callAdapter = KyberAdapter.address;
      const callSig = `takeOrder(address,bytes)`;
  
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.KYBER.TAKE_ORDER,
        [srcToken, 0, srcPercentage, destToken],
      );
  
      const preTxEthBalance = await web3.eth.getBalance(accounts[0]);
  
      let instance = await Stacker.deployed();
      await daiContract.approve(instance.address, spendAmount);
      await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs]
      );
  
      const postTxEthBalance = await web3.eth.getBalance(accounts[0]);
      assert.notEqual(postTxEthBalance, preTxEthBalance); // TODO: better assertion with big number comparison
    });
  });
});


  // // TODO: Decide whether to include this kind of test (direct calls to adapter).
  // // Was only using this to debug initially, and need to make contract function payable,
  // // so would be fine to remove.
  // describe('direct calls', () => {
  //   it("can execute a takeOrder from ETH to token", async () => {
  //     const srcToken = TOKEN_ADDRESSES.ETH;
  //     const srcAmount = web3.utils.toWei('1', 'ether');
  //     const destToken = TOKEN_ADDRESSES.DAI;

  //     const argEncoding = ['address', 'uint256', 'address']; // TODO: move to constants?
  //     const encodedCallArgs = web3.eth.abi.encodeParameters(
  //       argEncoding,
  //       [srcToken, srcAmount, destToken],
  //     );

  //     const preTxTokenBalance = await daiContract.balanceOf.call(accounts[0]);

  //     let instance = await KyberAdapter.deployed();
  //     await instance.takeOrder(
  //       GATEWAY_ADDRESSES.KYBER,
  //       encodedCallArgs,
  //       { value: srcAmount }
  //     );
  //     const postTxTokenBalance = await daiContract.balanceOf.call(accounts[0]);
  //     assert.notEqual(postTxTokenBalance, preTxTokenBalance); // TODO: better assertion with big number comparison
  //   });

  //   it("can execute a takeOrder from token to ETH", async () => {
  //     const srcToken = TOKEN_ADDRESSES.DAI;
  //     const srcAmount = web3.utils.toWei('100', 'ether');
  //     const destToken = TOKEN_ADDRESSES.ETH;

  //     const argEncoding = ['address', 'uint256', 'address']; // TODO: move to constants?
  //     const encodedCallArgs = web3.eth.abi.encodeParameters(
  //       argEncoding,
  //       [srcToken, srcAmount, destToken],
  //     );

  //     let instance = await KyberAdapter.deployed();

  //     const preTxEthBalance = await web3.eth.getBalance(instance.address);

  //     await daiContract.transfer(instance.address, srcAmount);
  //     await instance.takeOrder(
  //       GATEWAY_ADDRESSES.KYBER,
  //       encodedCallArgs
  //     );

  //     const postTxEthBalance = await web3.eth.getBalance(instance.address);
  //     assert.notEqual(postTxEthBalance, preTxEthBalance); // TODO: better assertion with big number comparison
  //   });
  // });
