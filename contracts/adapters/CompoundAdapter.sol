pragma solidity ^0.6.6;

import "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IStacker.sol";

contract CompoundAdapter {
    using SafeMath for uint256;

    uint256 constant MAX_PERCENTAGE = 10 ** 18; // 100%

    function lend(address, bytes calldata _callArgs)
        external
        payable
        returns (address[] memory receivedAssets)
    {
        (
            address srcToken, // underlying asset
            uint256 srcAmount,
            uint256 srcPercent, // Percent of total available balance
            address destToken // cToken
        ) = abi.decode(_callArgs, (address, uint256, uint256, address));

        // Sanity checks
        require(srcToken != address(0), "lend: srcToken cannot be empty");
        require(destToken != address(0), "lend: destToken cannot be empty");
        require(
            srcAmount == 0 || srcPercent == 0,
            "lend: can not specify both srcAmount and srcPercent"
        );
        require(
            srcAmount > 0 || srcPercent > 0,
            "lend: must specify either srcAmount or srcPercent"
        );
        if (srcPercent > 0) {
            require(srcPercent <= MAX_PERCENTAGE, "lend: srcPercent must be 100% or less");
        }

        // Mint cEther
        if (srcToken == IStacker(address(this)).ETH_ADDRESS()) {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(payable(address(this)).balance, srcPercent);
            }
            ICEther(destToken).mint{ value: srcAmount }();
        }
        // Mint cErc20
        else {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(
                    IERC20(srcToken).balanceOf(address(this)),
                    srcPercent
                );
            }
            require(ICErc20(srcToken).mint(srcAmount) == 0, "lend: mint failed");
        }

        // Return received assets array
        receivedAssets = new address[](1);
        receivedAssets[0] = destToken;
        return receivedAssets;
    }

    function redeem(address, bytes calldata _callArgs)
        external
        returns (address[] memory receivedAssets)
    {
        (
            address srcToken, // cToken
            uint256 srcAmount,
            uint256 srcPercent, // Percent of total available balance
            address destToken // underlying asset
        ) = abi.decode(_callArgs, (address, uint256, uint256, address));

        // Sanity checks
        require(srcToken != address(0), "redeem: srcToken cannot be empty");
        require(destToken != address(0), "redeem: destToken cannot be empty");
        require(
            srcAmount == 0 || srcPercent == 0,
            "redeem: can not specify both srcAmount and srcPercent"
        );
        require(
            srcAmount > 0 || srcPercent > 0,
            "redeem: must specify either srcAmount or srcPercent"
        );
        if (srcPercent > 0) {
            require(srcPercent <= MAX_PERCENTAGE, "redeem: srcPercent must be 100% or less");
        }

        // Redeem cTokens (can treat cEther and cErc20 the same)
        if (srcAmount == 0) {
            srcAmount = __calcRelativeAmount(
                IERC20(srcToken).balanceOf(address(this)),
                srcPercent
            );
        }
        require(ICErc20(srcToken).redeem(srcAmount) == 0, "redeem: redeem failed");

        // Return received assets array
        receivedAssets = new address[](1);
        receivedAssets[0] = destToken;
        return receivedAssets;
    }

    function __calcRelativeAmount(uint256 _amount, uint256 _percent)
        private
        pure
        returns (uint256)
    {
        return _amount.mul(_percent).div(MAX_PERCENTAGE);
    }
}

interface ICErc20 {
    function mint(uint mintAmount) external returns (uint256);
    function redeem(uint redeemTokens) external returns (uint256);
    function exchangeRateCurrent() external returns (uint256);
}

interface ICEther {
    function mint() external payable;
}
