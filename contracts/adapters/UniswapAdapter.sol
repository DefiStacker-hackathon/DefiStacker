pragma solidity ^0.6.6;

import "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IStacker.sol";

contract UniswapAdapter {
    using SafeMath for uint256;

    uint256 constant MAX_PERCENTAGE = 10 ** 18; // 100%

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

        // Min values all hardcoded to 1; probs fine for now
        if (srcToken == IStacker(address(this)).ETH_ADDRESS()) {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(payable(address(this)).balance, srcPercent);
            }

            address tokenExchange = IUniswapFactory(_gateway).getExchange(destToken);
            IUniswapExchange(tokenExchange).ethToTokenSwapInput{value: srcAmount}(
                1,
                block.timestamp + 1
            );
        }
        else if (destToken == IStacker(address(this)).ETH_ADDRESS()) {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(
                    IERC20(srcToken).balanceOf(address(this)),
                    srcPercent
                );
            }

            address tokenExchange = IUniswapFactory(_gateway).getExchange(srcToken);
            IERC20(srcToken).approve(tokenExchange, srcAmount);
            IUniswapExchange(tokenExchange).tokenToEthSwapInput(
                srcAmount,
                1,
                block.timestamp + 1
            );
        }
        else {
            if (srcAmount == 0) {
                srcAmount = __calcRelativeAmount(
                    IERC20(srcToken).balanceOf(address(this)),
                    srcPercent
                );
            }

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

    function __calcRelativeAmount(uint256 _amount, uint256 _percent)
        private
        pure
        returns (uint256)
    {
        return _amount.mul(_percent).div(MAX_PERCENTAGE);
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
