const Stacker = artifacts.require("Stacker");
const AaveAdapter = artifacts.require("AaveAdapter");
const UniswapAdapter = artifacts.require("UniswapAdapter");
const IERC20 = artifacts.require("IERC20");

const { GATEWAY_ADDRESSES, TOKEN_ADDRESSES, UNISWAP_DAI_EXCHANGE } = require('../utils/constants');

contract("AaveAdapter", accounts => {
  let daiContract;

  before(async () => {
    daiContract = await IERC20.at(TOKEN_ADDRESSES.DAI);

    // Transfer DAI to the primary account
    const daiAmount = web3.utils.toWei('10000', 'ether');
    await daiContract.transfer(accounts[0], daiAmount, { from: UNISWAP_DAI_EXCHANGE });
  })

  describe('Stacker-originated calls', () => {
    // it("can take out and repay a flash loan in ETH", async () => {});

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
      const uniswapArgEncoding = ['address', 'uint256', 'address']; // TODO: move to constants?
      const uniswapCallArgs = web3.eth.abi.encodeParameters(
        uniswapArgEncoding,
        [uniswapSrcToken, uniswapSrcAmount, uniswapDestToken]
      );
      const subsequentCalls = web3.eth.abi.encodeParameters(
        ['address[]', 'string[]', 'bytes[]'], // Format of a stack of calls
        [
          [uniswapAdapter],
          [uniswapCallSig],
          [uniswapCallArgs]
        ]
      );

      // Compose call stack
      const callAdapter = AaveAdapter.address;
      const callSig = `takeFlashLoan(address,bytes)`;
      const flashLoanArgEncoding = ['address', 'uint256', 'bytes']; // TODO: move to constants?
      const encodedCallArgs = web3.eth.abi.encodeParameters(
        flashLoanArgEncoding,
        [loanToken, loanAmount, subsequentCalls],
      );

      // Send enough DAI so that the loan can be paid back with interest since this is not profitable
      const spendAsset = loanToken;
      const spendAmount = web3.utils.toWei('200', 'ether');

      // Execute the stack
      let instance = await Stacker.deployed();
      await daiContract.approve(instance.address, spendAmount);
      await instance.executeStack(
        [spendAsset],
        [spendAmount], 
        [callAdapter],
        [callSig],
        [encodedCallArgs]
      );

      // const destTokenInterface = await IERC20.at(destToken);
      // const destTokenBalance = await destTokenInterface.balanceOf.call(accounts[0]);
      // assert.notEqual(destTokenBalance, web3.utils.toBN(0));
    });
  });
});
