const { BN, expectEvent } = require('@openzeppelin/test-helpers');

const Stacker = artifacts.require("Stacker");
const CompoundAdapter = artifacts.require("CompoundAdapter");
const IERC20 = artifacts.require("IERC20");
const ICErc20 = artifacts.require("ICErc20");

const {
  ENCODING_SCHEMAS,
  TOKEN_ADDRESSES,
  UNISWAP_DAI_EXCHANGE
} = require('../utils/constants');

contract("CompoundAdapter", accounts => {
  let daiContract, cDaiContract, cEthContract, cDaiERC20Contract, cEthERC20Contract;

  before(async () => {
    daiContract = await IERC20.at(TOKEN_ADDRESSES.DAI);
    cDaiContract = await ICErc20.at(TOKEN_ADDRESSES.CDAI);
    cEthContract = await ICErc20.at(TOKEN_ADDRESSES.CETH);
    cDaiERC20Contract = await IERC20.at(TOKEN_ADDRESSES.CDAI);
    cEthERC20Contract = await IERC20.at(TOKEN_ADDRESSES.CETH);

    // Transfer DAI to the primary account
    const daiAmount = web3.utils.toWei('10000', 'ether');
    await daiContract.transfer(accounts[0], daiAmount, { from: UNISWAP_DAI_EXCHANGE });
  })

  describe('Relative srcToken amounts', () => {
    describe('Eth <-> cEth', () => {
      it("can lend from ETH to cETH", async () => {
        const srcToken = TOKEN_ADDRESSES.ETH;
        const srcPercentage = web3.utils.toWei('0.5', 'ether'); // 50%
        const destToken = TOKEN_ADDRESSES.CETH;
    
        const spendAmount = web3.utils.toWei('1', 'ether');
        const spendAsset = srcToken;
        const callAdapter = CompoundAdapter.address;
        const callSig = `lend(address,bytes)`;
    
        const encodedCallArgs = web3.eth.abi.encodeParameters(
          ENCODING_SCHEMAS.COMPOUND.LEND,
          [srcToken, 0, srcPercentage, destToken],
        );
  
        // Get pre-tx on-chain data
        const actualSpendAmount =
          new BN(spendAmount)
            .mul(new BN(srcPercentage))
            .div(new BN(web3.utils.toWei('1', 'ether')));
        const mantissaExp = new BN(10).pow(new BN(28));
        const cEthToEthRate = new BN(await cEthContract.exchangeRateCurrent.call());
        const ethToCEthRate = mantissaExp.div(cEthToEthRate);
        const expectedCEthToReceive = actualSpendAmount.mul(ethToCEthRate).div(new BN(10).pow(new BN(10)));
        assert.isTrue(expectedCEthToReceive.gt(new BN(0)));
        const preTxTokenBalance = new BN(await cEthERC20Contract.balanceOf.call(accounts[0]));
  
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
        const postTxTokenBalance = new BN(await cEthERC20Contract.balanceOf.call(accounts[0]));
        const tokenBalanceDiff = postTxTokenBalance.sub(preTxTokenBalance);
        assert.isTrue(tokenBalanceDiff.gte(expectedCEthToReceive));
  
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
          paidOutAssets: [srcToken, destToken],
        });
      });

      it("can redeem from cETH to ETH", async () => {
        const srcToken = TOKEN_ADDRESSES.CETH;
        const srcPercentage = web3.utils.toWei('1', 'ether'); // 100%
        const destToken = TOKEN_ADDRESSES.ETH;

        const spendAmount = await cEthERC20Contract.balanceOf.call(accounts[0]);
        const spendAsset = srcToken;
        const callAdapter = CompoundAdapter.address;
        const callSig = `redeem(address,bytes)`;
    
        const encodedCallArgs = web3.eth.abi.encodeParameters(
          ENCODING_SCHEMAS.COMPOUND.LEND,
          [srcToken, 0, srcPercentage, destToken],
        );

        // Get pre-tx on-chain data
        const actualSpendAmount =
          new BN(spendAmount)
            .mul(new BN(srcPercentage))
            .div(new BN(web3.utils.toWei('1', 'ether')));
        const cEthToEthRate = new BN(await cEthContract.exchangeRateCurrent.call());
        const expectedEthToReceive = actualSpendAmount.mul(cEthToEthRate).div(new BN(10).pow(new BN(18)));
        assert.isTrue(expectedEthToReceive.gt(new BN(0)));
        const preTxEthBalance = new BN(await web3.eth.getBalance(accounts[0]));
  
        // Execute stacker
        let instance = await Stacker.deployed();
        await cEthERC20Contract.approve(instance.address, spendAmount);
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
        const expectedEthToReceiveWithSlippage = expectedEthToReceive.mul(new BN(99)).div(new BN(100));
        assert.isTrue(tokenBalanceDiff.gte(expectedEthToReceiveWithSlippage.sub(gasPaid)));
  
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

    describe('Dai <-> cDai', () => {
      it("can lend from DAI to cDAI", async () => {
        const srcToken = TOKEN_ADDRESSES.DAI;
        const srcPercentage = web3.utils.toWei('0.5', 'ether'); // 50%
        const destToken = TOKEN_ADDRESSES.CDAI;
    
        const spendAmount = web3.utils.toWei('100', 'ether');
        const spendAsset = srcToken;
        const callAdapter = CompoundAdapter.address;
        const callSig = `lend(address,bytes)`;
    
        const encodedCallArgs = web3.eth.abi.encodeParameters(
          ENCODING_SCHEMAS.COMPOUND.LEND,
          [srcToken, 0, srcPercentage, destToken],
        );

        // Get pre-tx on-chain data
        const actualSpendAmount =
          new BN(spendAmount)
            .mul(new BN(srcPercentage))
            .div(new BN(web3.utils.toWei('1', 'ether')));
        const mantissaExp = new BN(10).pow(new BN(28));
        const cDaiToDaiRate = new BN(await cDaiContract.exchangeRateCurrent.call());
        const daiToCDaiRate = mantissaExp.div(cDaiToDaiRate);
        const expectedCDaiToReceive = actualSpendAmount.mul(daiToCDaiRate).div(new BN(10).pow(new BN(10)));
        assert.isTrue(expectedCDaiToReceive.gt(new BN(0)));
        const preTxTokenBalance = new BN(await cDaiERC20Contract.balanceOf.call(accounts[0]));

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
        const postTxTokenBalance = new BN(await cDaiERC20Contract.balanceOf.call(accounts[0]));
        const tokenBalanceDiff = postTxTokenBalance.sub(preTxTokenBalance);
        assert.isTrue(tokenBalanceDiff.gte(expectedCDaiToReceive));

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

      it("can redeem from cDAI to DAI", async () => {
        const srcToken = TOKEN_ADDRESSES.CDAI;
        const srcPercentage = web3.utils.toWei('1', 'ether'); // 100%
        const destToken = TOKEN_ADDRESSES.DAI;

        const spendAmount = await cDaiERC20Contract.balanceOf.call(accounts[0]);
        const spendAsset = srcToken;
        const callAdapter = CompoundAdapter.address;
        const callSig = `redeem(address,bytes)`;
    
        const encodedCallArgs = web3.eth.abi.encodeParameters(
          ENCODING_SCHEMAS.COMPOUND.LEND,
          [srcToken, 0, srcPercentage, destToken],
        );

        // Get pre-tx on-chain data
        const actualSpendAmount =
          new BN(spendAmount)
            .mul(new BN(srcPercentage))
            .div(new BN(web3.utils.toWei('1', 'ether')));
        const cDaiToDaiRate = new BN(await cDaiContract.exchangeRateCurrent.call());
        const expectedDaiToReceive = actualSpendAmount.mul(cDaiToDaiRate).div(new BN(10).pow(new BN(18)));
        assert.isTrue(expectedDaiToReceive.gt(new BN(0)));
        const preTxTokenBalance = new BN(await daiContract.balanceOf.call(accounts[0]));
    
        // Execute stacker
        let instance = await Stacker.deployed();
        await cDaiERC20Contract.approve(instance.address, spendAmount);
        const res = await instance.executeStack(
          [spendAsset],
          [spendAmount],
          [callAdapter],
          [callSig],
          [encodedCallArgs]
        );
  
        // Check payout amount
        const postTxTokenBalance = new BN(await daiContract.balanceOf.call(accounts[0]));
        const tokenBalanceDiff = postTxTokenBalance.sub(preTxTokenBalance);
        assert.isTrue(tokenBalanceDiff.gte(expectedDaiToReceive));
  
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
          paidOutAssets: [destToken],
        });
      });
    });
  });
});
