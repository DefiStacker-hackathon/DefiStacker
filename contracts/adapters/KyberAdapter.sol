pragma solidity ^0.6.6;

import "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IStacker.sol";

contract KyberAdapter {
    using SafeMath for uint256;

    uint256 constant MAX_PERCENTAGE = 10 ** 18; // 100%

    /// @dev Marked as payable for unit testing
    receive() external payable {}

    /// @dev Marked as payable for unit testing
    function takeOrder(
        address _gateway,
        bytes calldata _callArgs
    )
        external
        payable
        returns (address[] memory receivedAssets)
    {
        (
            address srcToken,
            uint256 srcAmount,
            uint256 srcPercent, // Percent of total available balance
            address destToken
        ) = abi.decode(_callArgs, (address, uint256, uint256, address));
        require(
            srcAmount == 0 || srcPercent == 0,
            "takeOrder: can not specify both srcAmount and srcPercent"
        );
        require(
            srcAmount > 0 || srcPercent > 0,
            "takeOrder: must specify either srcAmount or srcPercent"
        );
        if (srcPercent > 0) {
            require(srcPercent <= MAX_PERCENTAGE, "takeOrder: srcPercent must be 100% or less");
        }

        // Min rate hardcoded to 1; probs fine for now
        if (srcToken == IStacker(address(this)).ETH_ADDRESS()) {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(payable(address(this)).balance, srcPercent);
            }

            IKyberNetworkProxy(_gateway).swapEtherToToken{value: srcAmount}(destToken, 1);
        }
        else if (destToken == IStacker(address(this)).ETH_ADDRESS()) {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(
                    IERC20(srcToken).balanceOf(address(this)),
                    srcPercent
                );
            }

            IERC20(srcToken).approve(_gateway, srcAmount);
            IKyberNetworkProxy(_gateway).swapTokenToEther(srcToken, srcAmount, 1);
        }
        else {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(
                    IERC20(srcToken).balanceOf(address(this)),
                    srcPercent
                );
            }

            IERC20(srcToken).approve(_gateway, srcAmount);
            IKyberNetworkProxy(_gateway).swapTokenToToken(srcToken, srcAmount, destToken, 1);
        }

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

interface IKyberNetworkProxy {
    function getExpectedRate(address, address, uint256) external view returns (uint256, uint256);
    function swapEtherToToken(address, uint256) external payable returns(uint256);
    function swapTokenToEther(address, uint256, uint256) external returns(uint256);
    function swapTokenToToken(address, uint256, address, uint256) external returns(uint256);
}
