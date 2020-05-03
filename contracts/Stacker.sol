// TODO: choose address to represent ETH (address(0) or KYBER_ETH or what?)

pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Stacker is Ownable {
    // TODO: add ExecuteStack and ExecuteCall events

    event AdapterAdded(address adapter, address gateway);

    event AdapterRemoved(address adapter, address gateway);

    mapping (address => address) public adapterToGateway;

    // EXTERNAL FUNCTIONS

    function addAdapter(address _adapter, address _gateway) external onlyOwner {
        adapterToGateway[_adapter] = _gateway;

        emit AdapterAdded(_adapter, _gateway);
    }

    /// @dev All `call-` prefixed param arrays are the same length, and each index represents a call in the stack
    function executeStack(
        address[] calldata _spendAssets,
        uint256[] calldata _spendAssetBalances,
        address[] calldata _callAdapters,
        string[] calldata _callSigs,
        bytes[] calldata _callArgs
    )
        external
        payable
    {
        // INPUT VALIDATION

        // TODO: add reason strings
        require(_callAdapters.length == _callSigs.length);
        require(_callAdapters.length == _callArgs.length);
        // TODO: validate no empty values for call args

        // CUSTODY SPEND ASSETS

        for (uint256 i = 0; i < _spendAssets.length; i++) {
            require(IERC20(_spendAssets[i]).transferFrom(msg.sender, address(this), _spendAssetBalances[i]));
        }

        // EXECUTE CALLS

        address[] memory trackedAssets = _spendAssets;
        for (uint256 i = 0; i < _callAdapters.length; i++) {
            address[] memory receivedAssets = __executeCall(
                _callAdapters[i],
                _callSigs[i],
                _callArgs[i],
                trackedAssets
            );
            trackedAssets = __concatArrays(trackedAssets, receivedAssets);
        }

        // Payout all balances to sender
        for (uint256 i = 0; i < trackedAssets.length; i++) {
            uint256 balance = IERC20(trackedAssets[i]).balanceOf(address(this));
            if (balance > 0) IERC20(trackedAssets[i]).transfer(msg.sender, balance);
        }

        // TODO: make event
        // emit StackExecuted();
    }

    function removeAdapter(address _adapter) external onlyOwner {
        address gateway = adapterToGateway[_adapter];
        delete adapterToGateway[_adapter];

        emit AdapterRemoved(_adapter, gateway);
    }

    // PRIVATE FUNCTIONS

    // TODO: Find more efficient way to do this... unsure if only adding unique values (removing duplicates) would be more or less efficient
    function __concatArrays(address[] memory _array1, address[] memory _array2)
        private
        pure
        returns (address[] memory)
    {
        uint256 newArrayLength = _array1.length + _array2.length;
        address[] memory newArray = new address[](newArrayLength);
        for (uint256 i = 0; i < _array1.length; i++) {
            newArray[i] = _array1[i];
        }
        for (uint256 i = 0; i < _array2.length; i++) {
            newArray[_array1.length + i] = _array2[i];
        }

        return newArray;
    }

    function __executeCall(
        address _adapter,
        string memory _sig,
        bytes memory _callArgs,
        address[] memory _trackedAssets
    )
        private
        returns (address[] memory)
    {
        (
            bool success,
            bytes memory returnData
        ) = _adapter.delegatecall(abi.encodeWithSignature(
            _sig,
            adapterToGateway[_adapter],
            _callArgs,
            _trackedAssets
        ));
        require(success, string(returnData));

        // TODO: make event
        // emit CallExecuted();

        return abi.decode(returnData, (address[]));
    }
}
