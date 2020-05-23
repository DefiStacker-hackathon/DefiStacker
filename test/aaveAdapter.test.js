const { BN, expectEvent } = require('@openzeppelin/test-helpers');

const Stacker = artifacts.require("Stacker");
const AaveAdapter = artifacts.require("AaveAdapter");
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

contract("AaveAdapter", accounts => {
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

  describe('1 call substack: Uniswap', () => {
    // 1. Take out Aave flash loan for 1000 DAI
    // 2. Trade 100 DAI for ETH on Uniswap
    // 3. Pay back Aave flash loan (programatically added in smart contract)
    it("can take out and repay a flash loan in DAI", async () => {
      // Define basic Flash Loan config
      const loanToken = TOKEN_ADDRESSES.DAI;
      const loanAmount = web3.utils.toWei('1000', 'ether');

      // Format Uniswap order as the lone subsequent call
      const uniswapAdapter = UniswapAdapter.address;
      const uniswapCallSig = `takeOrder(address,bytes)`;
      const uniswapSrcToken = loanToken;
      const uniswapSrcAmount = web3.utils.toWei('100', 'ether');
      const uniswapDestToken = TOKEN_ADDRESSES.ETH;
      const uniswapCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.UNISWAP.TAKE_ORDER,
        [uniswapSrcToken, uniswapSrcAmount, 0, uniswapDestToken]
      );
      const subsequentCalls = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.AAVE.SUBSEQUENT_CALLS,
        [
          [uniswapAdapter],
          [uniswapCallSig],
          [uniswapCallArgs]
        ]
      );

      // Compose call stack
      const callAdapter = AaveAdapter.address;
      const callSig = `takeFlashLoan(address,bytes)`;
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        ENCODING_SCHEMAS.AAVE.FLASH_LOAN,
        [loanToken, loanAmount, subsequentCalls],
      );

      // Send enough DAI so that the loan can be paid back with interest since this is not profitable
      const spendAsset = loanToken;
      const spendAmount = web3.utils.toWei('200', 'ether');

      // Get pre-tx on-chain data
      const expectedEthToReceive = new BN(
        await daiExchangeContract.getTokenToEthInputPrice.call(uniswapSrcAmount)
      );
      assert.isTrue(expectedEthToReceive.gt(new BN(0)));
      const preTxEthBalance = new BN(await web3.eth.getBalance(accounts[0]));

      // Execute the stack
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
      const ethBalanceDiff = postTxEthBalance.sub(preTxEthBalance);
      const expectedEthToReceiveWithSlippage = expectedEthToReceive.mul(new BN(98)).div(new BN(100));
      assert.isTrue(ethBalanceDiff.gt(expectedEthToReceiveWithSlippage.sub(gasPaid)));

      // Check events
      expectEvent(res.receipt, 'StackExecuted', {
        sender: accounts[0],
        stackId: "0",
        spendAssets: [spendAsset],
        callAdapters: [callAdapter],
        callSigs: [callSig],
        callArgs: [encodedCallArgs],
        paidOutAssets: [spendAsset, uniswapDestToken], // Change from spendAsset included
      });

      // Take flash loan call
      expectEvent(res.receipt, 'CallExecuted', {
        stackId: "0",
        callAdapter,
        callSig,
        callArgs: encodedCallArgs,
        incomingAssets: [], 
        outgoingAssets: [spendAsset], // Because the event is the entire flash loan sub-stack, not taking out a loan
      });
      // Trade on Uniswap call
      expectEvent(res.receipt, 'CallExecuted', {
        stackId: "0",
        callAdapter: uniswapAdapter,
        callSig: uniswapCallSig,
        callArgs: uniswapCallArgs,
        incomingAssets: [uniswapDestToken],
        outgoingAssets: [uniswapSrcToken],
      });
      // Payback flash loan call
      expectEvent(res.receipt, 'CallExecuted', {
        stackId: "0",
        callAdapter,
        callSig: `payBackFlashLoan(address,bytes)`,
        // callArgs: encodedCallArgs, // Could calculate with Aave flash loan rate
        incomingAssets: [],
        outgoingAssets: [loanToken],
      });
    });
  });
});
