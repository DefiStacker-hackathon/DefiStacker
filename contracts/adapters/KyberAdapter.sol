pragma solidity ^0.6.6;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KyberAdapter {
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
            // uint256 srcPercent, // TODO: should this be optionally expressable as a percent of total available balance?
            address destToken
        ) = abi.decode(_callArgs, (address, uint256, address));

        // Min rate hardcoded to 1; probs fine for now
        if (srcToken == address(0)) {
            IKyberNetworkProxy(_gateway).swapEtherToToken{value: srcAmount}(destToken, 1);
        }
        else if (destToken == address(0)) {
            IERC20(srcToken).approve(_gateway, srcAmount);
            IKyberNetworkProxy(_gateway).swapTokenToEther(srcToken, srcAmount, 1);
        }
        else {
            IERC20(srcToken).approve(_gateway, srcAmount);
            IKyberNetworkProxy(_gateway).swapTokenToToken(srcToken, srcAmount, destToken, 1);
        }

        receivedAssets = new address[](1);
        receivedAssets[0] = destToken;

        return receivedAssets;
    }
}

interface IKyberNetworkProxy {
    function swapEtherToToken(address, uint256) external payable returns(uint256);
    function swapTokenToEther(address, uint256, uint256) external returns(uint256);
    function swapTokenToToken(address, uint256, address, uint256) external returns(uint256);
}
