pragma solidity ^0.6.6;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UniswapAdapter {
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

        // Min values all hardcoded to 1; probs fine for now
        if (srcToken == address(0)) {
            address tokenExchange = IUniswapFactory(_gateway).getExchange(destToken);
            IUniswapExchange(tokenExchange).ethToTokenSwapInput{value: srcAmount}(
                1,
                block.timestamp + 1
            );
        }
        else if (destToken == address(0)) {
            address tokenExchange = IUniswapFactory(_gateway).getExchange(srcToken);
            IERC20(srcToken).approve(tokenExchange, srcAmount);
            IUniswapExchange(tokenExchange).tokenToEthSwapInput(
                srcAmount,
                1,
                block.timestamp + 1
            );
        }
        else {
            address tokenExchange = IUniswapFactory(_gateway).getExchange(srcToken);
            IERC20(srcToken).approve(tokenExchange, srcAmount);
            IUniswapExchange(tokenExchange).tokenToTokenSwapInput(
                srcAmount,
                1,
                1,
                block.timestamp + 1,
                destToken
            );
        }

        receivedAssets = new address[](1);
        receivedAssets[0] = destToken;

        return receivedAssets;
    }
}

interface IUniswapExchange {
    // Trade ETH to ERC20
    function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline)
        external
        payable
        returns (uint256 tokens_bought);
    // Trade ERC20 to ETH
    function tokenToEthSwapInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline)
        external
        returns (uint256 eth_bought);
    // Trade ERC20 to ERC20
    function tokenToTokenSwapInput(
        uint256 tokens_sold,
        uint256 min_tokens_bought,
        uint256 min_eth_bought,
        uint256 deadline,
        address token_addr
    )
        external
        returns (uint256 tokens_bought);
}

interface IUniswapFactory {
    function getExchange(address token) external view returns (address exchange);
}
