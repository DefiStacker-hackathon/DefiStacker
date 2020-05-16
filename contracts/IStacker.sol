pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

interface IStacker {
    function ETH_ADDRESS() external view returns (address);

    function executeStack(
        address[] calldata,
        uint256[] calldata,
        address[] calldata,
        string[] calldata,
        bytes[] calldata
    )
        external
        payable;

    function executeStackNoPayout(
        address[] calldata,
        uint256[] calldata,
        address[] calldata,
        string[] calldata,
        bytes[] calldata
    )
        external
        payable;
}
