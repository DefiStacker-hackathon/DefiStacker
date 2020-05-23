const { BN, expectEvent } = require('@openzeppelin/test-helpers');

const Stacker = artifacts.require("Stacker");
const UniswapAdapter = artifacts.require("UniswapAdapter");
const IERC20 = artifacts.require("IERC20");
const IUniswapFactory = artifacts.require("IUniswapFactory");
const IUniswapExchange = artifacts.require("IUniswapExchange");

const {
  ENCODING_SCHEMAS,
  GATEWAY_ADDRESSES,
  TOKEN_ADDRESSES,
  UNISWAP_DAI_EXCHANGE
} = require('../utils/constants');

contract("UniswapAdapter", accounts => {
  let daiContract, daiExchangeContract;

  before(async () => {
    daiContract = await IERC20.at(TOKEN_ADDRESSES.DAI);

    // Transfer DAI to the primary account
    const daiAmount = web3.utils.toWei('10000', 'ether');
    await daiContract.transfer(accounts[0], daiAmount, { from: UNISWAP_DAI_EXCHANGE });

    // Get Uniswap DAI exchange contract
    const uniswapFactory = await IUniswapFactory.at(GATEWAY_ADDRESSES.UNISWAP);
    const daiExchangeAddress = await uniswapFactory.getExchange.call(TOKEN_ADDRESSES.DAI);
    daiExchangeContract = await IUniswapExchange.at(daiExchangeAddress);
  })

  describe('Static srcToken amounts', () => {
    it("can execute a takeOrder from ETH to token", async () => {
      const srcToken = TOKEN_ADDRESSES.ETH;
      const srcAmount = web3.utils.toWei('1', 'ether');
      const destToken = TOKEN_ADDRESSES.DAI;
  
      // Prepare tx args
      const spendAmount = srcAmount;
      const spendAsset = srcToken;
      const callAdapter = UniswapAdapter.address;
      const callSig = `takeOrder(address,bytes)`;
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.UNISWAP.TAKE_ORDER,
        [srcToken, srcAmount, 0, destToken],
      );
  
      // Get pre-tx on-chain data
      const expectedDaiToReceive = new BN(
        await daiExchangeContract.getEthToTokenInputPrice.call(spendAmount)
      );
      assert.isTrue(expectedDaiToReceive.gt(new BN(0)));
      const preTxTokenBalance = new BN(await daiContract.balanceOf.call(accounts[0]));
  
      // Execute stacker
      let instance = await Stacker.deployed();
      const res = await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs],
        { value: spendAmount }
      );

      // Check payout amount
      const postTxTokenBalance = new BN(await daiContract.balanceOf.call(accounts[0]));
      const tokenBalanceDiff = postTxTokenBalance.sub(preTxTokenBalance);
      assert.isTrue(tokenBalanceDiff.eq(expectedDaiToReceive));

      // Check events
      expectEvent(res.receipt, 'CallExecuted', {
        stackId: "0",
        callAdapter,
        callSig,
        callArgs: encodedCallArgs,
        incomingAssets: [destToken],
        outgoingAssets: [srcToken],
      });
      expectEvent(res.receipt, 'StackExecuted', {
        sender: accounts[0],
        stackId: "0",
        spendAssets: [spendAsset],
        callAdapters: [callAdapter],
        callSigs: [callSig],
        callArgs: [encodedCallArgs],
        paidOutAssets: [destToken],
      });
    });
  
    it("can execute a takeOrder from token to ETH", async () => {
      const srcToken = TOKEN_ADDRESSES.DAI;
      const srcAmount = web3.utils.toWei('100', 'ether');
      const destToken = TOKEN_ADDRESSES.ETH;
  
      // Prepare tx args
      const spendAmount = srcAmount;
      const spendAsset = srcToken;
      const callAdapter = UniswapAdapter.address;
      const callSig = `takeOrder(address,bytes)`;
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.UNISWAP.TAKE_ORDER,
        [srcToken, srcAmount, 0, destToken],
      );
  
      // Get pre-tx on-chain data
      const expectedEthToReceive = new BN(
        await daiExchangeContract.getTokenToEthInputPrice.call(spendAmount)
      );
      assert.isTrue(expectedEthToReceive.gt(new BN(0)));
      const preTxEthBalance = new BN(await web3.eth.getBalance(accounts[0]));
  
      // Execute stacker
      let instance = await Stacker.deployed();
      await daiContract.approve(instance.address, spendAmount);
      const res = await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs]
      );
  
      // Check payout amount
      const tx = await web3.eth.getTransaction(res.tx);
      const gasPaid = new BN(res.receipt.gasUsed).mul(new BN(tx.gasPrice));
      const postTxEthBalance = new BN(await web3.eth.getBalance(accounts[0]));
      const tokenBalanceDiff = postTxEthBalance.sub(preTxEthBalance);
      const expectedEthToReceiveWithSlippage = expectedEthToReceive.mul(new BN(98)).div(new BN(100));
      assert.isTrue(tokenBalanceDiff.gt(expectedEthToReceiveWithSlippage.sub(gasPaid)));

      // Check events
      expectEvent(res.receipt, 'CallExecuted', {
        stackId: "1",
        callAdapter,
        callSig,
        callArgs: encodedCallArgs,
        incomingAssets: [destToken],
        outgoingAssets: [srcToken],
      });
      expectEvent(res.receipt, 'StackExecuted', {
        sender: accounts[0],
        stackId: "1",
        spendAssets: [spendAsset],
        callAdapters: [callAdapter],
        callSigs: [callSig],
        callArgs: [encodedCallArgs],
        paidOutAssets: [destToken],
      });
    });
  });

  describe('Relative srcToken amounts', () => {
    it("can execute a takeOrder from ETH to token", async () => {
      const srcToken = TOKEN_ADDRESSES.ETH;
      const srcPercentage = web3.utils.toWei('0.5', 'ether'); // 50%
      const destToken = TOKEN_ADDRESSES.DAI;
  
      const spendAmount = web3.utils.toWei('1', 'ether');
      const spendAsset = srcToken;
      const callAdapter = UniswapAdapter.address;
      const callSig = `takeOrder(address,bytes)`;
  
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.UNISWAP.TAKE_ORDER,
        [srcToken, 0, srcPercentage, destToken],
      );

      // Get pre-tx on-chain data
      const actualSpendAmount =
        new BN(spendAmount)
          .mul(new BN(srcPercentage))
          .div(new BN(web3.utils.toWei('1', 'ether')));
      const expectedDaiToReceive = new BN(
        await daiExchangeContract.getEthToTokenInputPrice.call(actualSpendAmount)
      );
      assert.isTrue(expectedDaiToReceive.gt(new BN(0)));
      const preTxTokenBalance = new BN(await daiContract.balanceOf.call(accounts[0]));

      // Execute stacker
      let instance = await Stacker.deployed();
      const res = await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs],
        { value: spendAmount }
      );
  
      // Check payout amount
      const postTxTokenBalance = new BN(await daiContract.balanceOf.call(accounts[0]));
      const tokenBalanceDiff = postTxTokenBalance.sub(preTxTokenBalance);
      assert.isTrue(tokenBalanceDiff.eq(expectedDaiToReceive));

      // Check events
      expectEvent(res.receipt, 'CallExecuted', {
        stackId: "2",
        callAdapter,
        callSig,
        callArgs: encodedCallArgs,
        incomingAssets: [destToken],
        outgoingAssets: [srcToken],
      });
      expectEvent(res.receipt, 'StackExecuted', {
        sender: accounts[0],
        stackId: "2",
        spendAssets: [spendAsset],
        callAdapters: [callAdapter],
        callSigs: [callSig],
        callArgs: [encodedCallArgs],
        paidOutAssets: [srcToken, destToken],
      });
    });
  
    it("can execute a takeOrder from token to ETH", async () => {
      const srcToken = TOKEN_ADDRESSES.DAI;
      const srcPercentage = web3.utils.toWei('0.5', 'ether'); // 50%
      const destToken = TOKEN_ADDRESSES.ETH;
  
      // Prepare tx args
      const spendAmount =  web3.utils.toWei('100', 'ether');
      const spendAsset = srcToken;
      const callAdapter = UniswapAdapter.address;
      const callSig = `takeOrder(address,bytes)`;
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.UNISWAP.TAKE_ORDER,
        [srcToken, 0, srcPercentage, destToken],
      );

      // Get pre-tx on-chain data
      const actualSpendAmount =
        new BN(spendAmount)
          .mul(new BN(srcPercentage))
          .div(new BN(web3.utils.toWei('1', 'ether')));
      const expectedEthToReceive = new BN(
        await daiExchangeContract.getTokenToEthInputPrice.call(actualSpendAmount)
      );
      assert.isTrue(expectedEthToReceive.gt(new BN(0)));
      const preTxEthBalance = new BN(await web3.eth.getBalance(accounts[0]));

      // Execute stacker
      let instance = await Stacker.deployed();
      await daiContract.approve(instance.address, spendAmount);
      const res = await instance.executeStack(
        [spendAsset],
        [spendAmount],
        [callAdapter],
        [callSig],
        [encodedCallArgs]
      );
  
      // Check payout amount
      const tx = await web3.eth.getTransaction(res.tx);
      const gasPaid = new BN(res.receipt.gasUsed).mul(new BN(tx.gasPrice));
      const postTxEthBalance = new BN(await web3.eth.getBalance(accounts[0]));
      const tokenBalanceDiff = postTxEthBalance.sub(preTxEthBalance);
      const expectedEthToReceiveWithSlippage = expectedEthToReceive.mul(new BN(98)).div(new BN(100));
      assert.isTrue(tokenBalanceDiff.gt(expectedEthToReceiveWithSlippage.sub(gasPaid)));

      // Check events
      expectEvent(res.receipt, 'CallExecuted', {
        stackId: "3",
        callAdapter,
        callSig,
        callArgs: encodedCallArgs,
        incomingAssets: [destToken],
        outgoingAssets: [srcToken],
      });
      expectEvent(res.receipt, 'StackExecuted', {
        sender: accounts[0],
        stackId: "3",
        spendAssets: [spendAsset],
        callAdapters: [callAdapter],
        callSigs: [callSig],
        callArgs: [encodedCallArgs],
        paidOutAssets: [srcToken, destToken],
      });
    });
  });
});
