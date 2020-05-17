pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./IStacker.sol";

contract Stacker is IStacker, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    event AdapterAdded(address adapter, address gateway);

    event AdapterRemoved(address adapter, address gateway);

    event CallExecuted(
        uint256 stackId,
        address callAdapter,
        string callSig,
        bytes callArgs,
        address[] incomingAssets,
        uint256[] incomingAmounts,
        address[] outgoingAssets,
        uint256[] outgoingAmounts
    );

    event StackExecuted(
        address indexed sender,
        uint256 stackId,
        address[] spendAssets,
        uint256[] spendAssetBalances,
        address[] callAdapters,
        string[] callSigs,
        bytes[] callArgs,
        address[] paidOutAssets,
        uint256[] paidOutAmounts
    );

    // CONSTANTS

    address public constant override ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // STORAGE

    uint256 public stackId;
    mapping (address => address) public adapterToGateway;
    EnumerableSet.AddressSet internal adapters;
    EnumerableSet.AddressSet internal usedAssets;

    // MODIFIERS

    modifier onlyDelegated() {
        require(msg.sender == address(this), "Sender must be this contract");
        _;
    }

    // EXTERNAL FUNCTIONS

    // Needed to receive ETH from adapters
    receive() external payable {}

    function addAdapter(address _adapter, address _gateway) external onlyOwner {
        require(EnumerableSet.add(adapters, _adapter), "addAdapter: Adapter already added");
        adapterToGateway[_adapter] = _gateway;

        emit AdapterAdded(_adapter, _gateway);
    }

    /// @dev This is for flash loan hooks to run.
    /// _spendAssets are the flash loaned assets.
    /// Last call in the stack should be to pay back the flash loan.
    function executeStackNoPayout(
        address[] memory _spendAssets,
        uint256[] memory _spendAssetBalances,
        address[] memory _callAdapters,
        string[] memory _callSigs,
        bytes[] memory _callArgs
    )
        public // TODO: Getting stack error when `external`
        override
        payable
    {
        // Only adapter can make this call
        require(
            EnumerableSet.contains(adapters, msg.sender),
            "executeStackNoPayout: Only an adapter can call this function"
        );

        __custodyAssets(_spendAssets, _spendAssetBalances);
        __executeCalls(_callAdapters, _callSigs, _callArgs);
    }

    /// @dev All `call-` prefixed param arrays are the same length, and each index represents a call in the stack
    function executeStack(
        address[] memory _spendAssets,
        uint256[] memory _spendAssetBalances,
        address[] memory _callAdapters,
        string[] memory _callSigs,
        bytes[] memory _callArgs
    )
        public // TODO: Getting stack error when `external`
        override
        payable
    {
        __validateExecuteStackInputs(
            _spendAssets,
            _spendAssetBalances,
            _callAdapters,
            _callSigs,
            _callArgs
        );

        __custodyAssets(_spendAssets, _spendAssetBalances);

        __executeCalls(_callAdapters, _callSigs, _callArgs);

        (
            address[] memory paidOutAssets,
            uint256[] memory paidOutAmounts
        ) = __payoutBalances();

        emit StackExecuted(
            msg.sender,
            stackId,
            _spendAssets,
            _spendAssetBalances,
            _callAdapters,
            _callSigs,
            _callArgs,
            paidOutAssets,
            paidOutAmounts
        );

        // Increment stackId
        stackId++;
    }

    function removeAdapter(address _adapter) external onlyOwner {
        address gateway = adapterToGateway[_adapter];
        delete adapterToGateway[_adapter];

        emit AdapterRemoved(_adapter, gateway);
    }

    // PRIVATE FUNCTIONS

    function __custodyAssets(address[] memory _assets, uint256[] memory _amounts) private {
        for (uint256 i = 0; i < _assets.length; i++) {
            if (_assets[i] == ETH_ADDRESS) {
                require(
                    payable(address(this)).balance >= _amounts[i],
                    "executeStack: Not enough ETH sent"
                );
            }
            else {
                IERC20(_assets[i]).safeTransferFrom(
                    msg.sender,
                    address(this),
                    _amounts[i]
                );
            }
            EnumerableSet.add(usedAssets, _assets[i]);
        }
    }

    function __executeCall(
        address _callAdapter,
        string memory _callSig,
        bytes memory _callArgs
    )
        private
    {
        // Record balances prior to call
        uint256[] memory preBalances = __preProcessCall();

        // Make the call
        (
            bool success,
            bytes memory returnData
        ) = _callAdapter.delegatecall(
            abi.encodeWithSignature(_callSig, adapterToGateway[_callAdapter], _callArgs)
        );
        require(success, string(returnData));
        address[] memory receivedAssets = abi.decode(returnData, (address[]));

        // Post-process call to get incoming/outgoing assets
        (
            address[] memory incomingAssets,
            uint256[] memory incomingAmounts,
            address[] memory outgoingAssets,
            uint256[] memory outgoingAmounts
        ) = __postProcessCall(preBalances, receivedAssets);

        emit CallExecuted(
            stackId,
            _callAdapter,
            _callSig,
            _callArgs,
            incomingAssets,
            incomingAmounts,
            outgoingAssets,
            outgoingAmounts
        );
    }

    function __executeCalls(
        address[] memory _callAdapters,
        string[] memory _callSigs,
        bytes[] memory _callArgs
    )
        private
    {
        for (uint256 i = 0; i < _callAdapters.length; i++) {
            __executeCall(_callAdapters[i], _callSigs[i], _callArgs[i]);
        }
    }

    function __payoutBalances()
        private
        returns (address[] memory paidOutAssets_, uint256[] memory paidOutAmounts_)
    {
        uint256 assetsCount = EnumerableSet.length(usedAssets);
        address[] memory assets = new address[](assetsCount);
        uint256[] memory balances = new uint256[](assetsCount);

        // Calc assets to pay and store assets and balances in memory
        uint256 assetsToPayCount;
        for (uint256 i = 0; i < assetsCount; i++) {
            address asset = EnumerableSet.at(usedAssets, i);
            assets[i] = asset;

            uint256 balance;
            if (asset == ETH_ADDRESS) {
                balance = payable(address(this)).balance;
            }
            else {
                balance = IERC20(asset).balanceOf(address(this));
            }

            if (balance > 0) {
                balances[i] = balance;
                assetsToPayCount++;
            }
        }
        paidOutAssets_ = new address[](assetsToPayCount);
        paidOutAmounts_ = new uint256[](assetsToPayCount);

        // Pay out assets
        uint256 paidAssetsCount;
        for (uint256 i = 0; i < assetsCount; i++) {
            address asset = assets[i];
            uint256 balance = balances[i];

            EnumerableSet.remove(usedAssets, asset);
            if (balance == 0) continue;

            if (asset == ETH_ADDRESS) {
                (bool success,) = msg.sender.call{value: balance}("");
                require(success, "__payoutBalances: Eth transfer to sender failed");
            }
            else {
                IERC20(asset).safeTransfer(msg.sender, balance);
            }

            // Add to return values
            paidOutAssets_[paidAssetsCount] = asset;
            paidOutAmounts_[paidAssetsCount] = balance;       
            paidAssetsCount++;
        }
        assert(EnumerableSet.length(usedAssets) == 0);
    }

    function __preProcessCall() private view returns (uint256[] memory preBalances_) {
        preBalances_ = new uint256[](EnumerableSet.length(usedAssets));
        for (uint256 i = 0; i < preBalances_.length; i++) {
            address asset = EnumerableSet.at(usedAssets, i);
            if (asset == ETH_ADDRESS) {
                preBalances_[i] = payable(address(this)).balance;
            }
            else {
                preBalances_[i] = IERC20(asset).balanceOf(address(this));
            }
        }
    }

    function __postProcessCall(
        uint256[] memory preBalances,
        address[] memory receivedAssets
    )
        private
        returns (
            address[] memory incomingAssets_,
            uint256[] memory incomingAmounts_,
            address[] memory outgoingAssets_,
            uint256[] memory outgoingAmounts_
        )
    {
        // Get balance diffs of old assets
        uint256[] memory balanceDiffs = new uint256[](preBalances.length);
        bool[] memory areOutgoingAssets = new bool[](preBalances.length);
        uint256 outgoingAssetsCount;
        uint256 incomingAssetsCount;
        for (uint256 i = 0; i < preBalances.length; i++) {
            address asset = EnumerableSet.at(usedAssets, i);
            uint256 balance;
            if (asset == ETH_ADDRESS) {
                balance = payable(address(this)).balance;
            }
            else {
                balance = IERC20(asset).balanceOf(address(this));
            }
            if (balance > preBalances[i]) {
                balanceDiffs[i] = balance.sub(preBalances[i]);
                incomingAssetsCount++;
            }
            else if (balance < preBalances[i]) {
                balanceDiffs[i] = preBalances[i].sub(balance);
                outgoingAssetsCount++;
                areOutgoingAssets[i] = true;
            }
        }

        // Add received assets to incoming/outgoing asset counts
        uint256 newAssetsCount;
        for (uint256 i = 0; i < receivedAssets.length; i++) {
            if (!EnumerableSet.contains(usedAssets, receivedAssets[i])) {
                newAssetsCount++;
            }
        }

        // Construct incoming/outgoing asset arrays
        incomingAssets_ = new address[](incomingAssetsCount.add(newAssetsCount));
        incomingAmounts_ = new uint256[](incomingAssetsCount.add(newAssetsCount));
        outgoingAssets_ = new address[](outgoingAssetsCount);
        outgoingAmounts_ = new uint256[](outgoingAssetsCount);
        for (uint256 i = 0; i < preBalances.length; i++) {
            if (balanceDiffs[i] == 0) continue;
            if (areOutgoingAssets[i]) {
                outgoingAssets_[i] = EnumerableSet.at(usedAssets, i);
                outgoingAmounts_[i] = balanceDiffs[i];
            }
            else {
                incomingAssets_[i] = EnumerableSet.at(usedAssets, i);
                incomingAmounts_[i] = balanceDiffs[i];
            }
        }

        // Update usedAssets with assets received in call, and add to incoming/outgoing assets
        uint256 receivedAssetsAddedCount;
        for (uint256 i = 0; i < receivedAssets.length; i++) {
            uint256 index = incomingAssetsCount.add(receivedAssetsAddedCount);
            address asset = receivedAssets[i];
            uint256 balance;
            if (asset == ETH_ADDRESS) {
                balance = payable(address(this)).balance;
            }
            else {
                balance = IERC20(asset).balanceOf(address(this));
            }
            incomingAssets_[index] = asset;
            incomingAmounts_[index] = balance;
            receivedAssetsAddedCount++;

            EnumerableSet.add(usedAssets, asset);
        }
    }

    function __validateExecuteStackInputs(
        address[] memory _spendAssets,
        uint256[] memory _spendAssetBalances,
        address[] memory _callAdapters,
        string[] memory _callSigs,
        bytes[] memory _callArgs
    )
        private
        pure
    {
        require(
            _callAdapters.length == _callSigs.length,
            "__validateExecuteStackInputs: _callAdapters and _callSigs unequal lengths"
        );
        require(
            _callAdapters.length == _callArgs.length,
            "__validateExecuteStackInputs: _callAdapters and _callArgs unequal lengths"
        );
        require(
            _spendAssets.length == _spendAssetBalances.length,
            "__validateExecuteStackInputs: _spendAssets and _spendAssetBalances unequal lengths"
        );
    }
}
