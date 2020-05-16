pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../IStacker.sol";

interface IAaveFlashLoanReceiver {
    function executeOperation(address, uint256, uint256, bytes calldata) external;
}

/// @dev `_gateway` refers to Aave's address router
contract AaveAdapter is IAaveFlashLoanReceiver {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address constant AAVE_ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address immutable ADAPTER_ADDRESS;
    address immutable STACKER_ADDRESS;

    constructor(address _stacker) public payable {
        ADAPTER_ADDRESS = address(this);
        STACKER_ADDRESS = _stacker;
    }

    /// @dev Expected hook called during IAaveLendingPool().flashLoan()
    function executeOperation(
        address _reserve,
        uint256 _amount,
        uint256 _fee,
        bytes calldata _params
    )
        external
        override
    {
        // require(_amount <= getBalanceInternal(address(this), _reserve), "Invalid balance, was the flashLoan successful?");

        // Format loan asset as spend asset
        address[] memory spendAssets = new address[](1);
        uint256[] memory spendBalances = new uint256[](1);
        spendAssets[0] = _reserve;
        spendBalances[0] = _amount;

        (
            address[] memory callAdapters,
            string[] memory callSigs,
            bytes[] memory callArgs
        ) = __assembleFlashLoanStack(_params, abi.encode(_reserve, _amount.add(_fee)));

        // Execute calls in the new stack by sending a revised stack request that does not payout funds
        if (_reserve == AAVE_ETH) {
            IStacker(STACKER_ADDRESS).executeStackNoPayout{value: _amount}(
                spendAssets,
                spendBalances,
                callAdapters,
                callSigs,
                callArgs
            );
        }
        else {
            IERC20(_reserve).approve(STACKER_ADDRESS, _amount);
            IStacker(STACKER_ADDRESS).executeStackNoPayout(
                spendAssets,
                spendBalances,
                callAdapters,
                callSigs,
                callArgs
            );
        }
    }

    function payBackFlashLoan(address _gateway, bytes calldata _callArgs)
        external
        returns (address[] memory)
    {
        (address reserve, uint256 amountDue) = abi.decode(_callArgs, (address, uint256));

        address payable core = IAaveLendingPoolAddressesProvider(_gateway).getLendingPoolCore();
        if (reserve == AAVE_ETH) {
            (bool success,) = core.call{value: amountDue}("");
            require(success == true, "Couldn't transfer ETH");
        }
        else {
            IERC20(reserve).safeTransfer(core, amountDue);
        }
    }

    function takeFlashLoan(address _gateway, bytes calldata _callArgs)
        external
        returns (address[] memory)
    {
        address lendingPool = IAaveLendingPoolAddressesProvider(_gateway).getLendingPool();
        (
            address token,
            uint256 amount,
            bytes memory subsequentCalls
        ) = abi.decode(_callArgs, (address, uint256, bytes));

        address reserve;
        if (token == IStacker(STACKER_ADDRESS).ETH_ADDRESS()) {
            reserve = AAVE_ETH;
        }
        else {
            reserve = token;
        }
        IAaveLendingPool(lendingPool).flashLoan(
            ADAPTER_ADDRESS,
            reserve,
            amount,
            subsequentCalls
        );
    }

    function __assembleFlashLoanStack(
        bytes memory _encodedCalls,
        bytes memory _paybackArgs
    )
        private
        view
        returns (
            address[] memory newCallAdapters_,
            string[] memory newCallSigs_,
            bytes[] memory newCallArgs_
        )
    {
        (
            address[] memory callAdapters,
            string[] memory callSigs,
            bytes[] memory callArgs
        ) = abi.decode(_encodedCalls, (address[], string[], bytes[]));

        require(
            callAdapters.length > 0,
            "__assembleFlashLoanStack: Must have more than one subsequent call"
        );
        require(
            callAdapters.length == callSigs.length,
            "__assembleFlashLoanStack: callAdapters and callSigs must have same length"
        );
        require(
            callAdapters.length == callArgs.length,
            "__assembleFlashLoanStack: callAdapters and callArgs must have same length"
        );

        uint256 newCallsLength = callAdapters.length.add(1);
        newCallAdapters_ = new address[](newCallsLength);
        newCallSigs_ = new string[](newCallsLength);
        newCallArgs_ = new bytes[](newCallsLength);

        for (uint256 i = 0; i < callAdapters.length; i++) {
            newCallAdapters_[i] = callAdapters[i];
            newCallSigs_[i] = callSigs[i];
            newCallArgs_[i] = callArgs[i];
        }

        newCallAdapters_[newCallsLength - 1] = ADAPTER_ADDRESS;
        newCallSigs_[newCallsLength - 1] = 'payBackFlashLoan(address,bytes)';
        newCallArgs_[newCallsLength - 1] = _paybackArgs;
    }
}

interface IAaveLendingPool {
  function addressesProvider () external view returns ( address );
  function flashLoan ( address _receiver, address _reserve, uint256 _amount, bytes calldata _params ) external;
}

interface IAaveLendingPoolAddressesProvider {
    function getLendingPoolCore() external view returns (address payable);
    function getLendingPool() external view returns (address);
}
