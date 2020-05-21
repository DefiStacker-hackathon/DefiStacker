pragma solidity ^0.6.0;

import "../../../../node_modules/cdpsaver-contracts/contracts/mcd/general/SaverProxyActions.sol";


contract CustomProxyActions is SaverProxyActions {

    function __executeCall(
        address _callAdapter,
        string memory _callSig,
        bytes memory _callArgs
    )
        internal
    {
        if(_callAdapter == address(this)){
            address(this).delegatecall(abi.encode(_callSig, _callArgs));
        }
    }

    /// @notice Repay - draws collateral, converts to Dai and repays the debt
    /// @dev Must be called by the DSProxy contract that owns the CDP
    // / @param _data Uint array [cdpId, amount, minPrice, exchangeType, gasCost, 0xPrice]
    // / @param _joinAddr Address of the join contract for the CDP collateral
    // / @param _exchangeAddress Address of 0x exchange that should be called
    // / @param _callData data to call 0x exchange with
    // function repay(bytes _callArgs)
    //     private
    // {

    // }

    // function boost_(bytes _callArgs) 
    //     private
    // {

    // }  

    /// @notice Checks if the collateral amount is increased after boost

    /// @notice Boost - draws Dai, converts to collateral and adds to CDP
    
    /// @notice Repay - draws collateral, converts to Dai and repays the debt

}