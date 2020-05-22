pragma solidity ^0.6.0;

import "../../../../node_modules/cdpsaver-contracts/contracts/mcd/general/SaverProxyActions.sol";
import "../constants/ConstantAddresses.sol";


contract ExtendedProxyActions {
    
    /// @notice Gets the maximum amount of debt available to generate
    // function getMaxDebt(bytes memory _callArgs)

    /// @notice Gets the maximum amount of collateral available to draw
    // function getMaxCollateral(uint _cdpId, bytes32 _ilk, address _joinAddr) public view returns (uint) {

    /// @notice Calculates the fee amount
    // function getFee(uint _amount, uint _gasCost, address _owner) internal returns (uint feeAmount) {

    // function getMaxCollateral(uint _cdpId, bytes32 _ilk, address _joinAddr) public view returns (uint) {

    /// @notice Paybacks Dai debt.
    // function paybackDebt(uint _cdpId, bytes32 _ilk, uint _daiAmount, address _owner) internal {

    /// @notice Repay - draws collateral, converts to Dai and repays the debt. Should call either Kyber or Uniswap
    // function repay(

    /// @notice Boost - draws Dai, converts to collateral and adds to CDP.  Should call either Kyber or Uniswap
    // function boost(

    /*
     The Stability Fee continuously accrues to the generated Dai Balance of a user’s Vault.
     Vault owners are free to pay back Dai at any time they wish. Vaults have no standards around repayment,
     instead, they require the owner of the Vault to keep its Collateralization Ratio above the Liquidation Ratio.
     */
    /// @notice refinanceUnderlyingCollatoral - changed underlying collatoral to desired collatoral.  Take into consideration Stability Fee.
    // function refinanceUnderlyingCollatoral(
    



}