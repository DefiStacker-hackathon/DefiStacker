import { ethers } from "ethers";
import { Contract, TransactionWrapper } from "./Contract";

export class AaveAdapter extends Contract {
  /**
   * The contract abis.
   */
  public static readonly abi: string[] = [
    "constructor(address _stacker) payable",
    "function executeOperation(address _reserve, uint256 _amount, uint256 _fee, bytes _params)",
    "function payBackFlashLoan(address _gateway, bytes _callArgs) returns (address[])",
    "function takeFlashLoan(address _gateway, bytes _callArgs) returns (address[])",
  ];
  /**
   * ```solidity
   * function executeOperation(address,uint256,uint256,bytes)
   * ```
   *
   */
  executeOperation: (
    _reserve: string,
    _amount: ethers.BigNumberish,
    _fee: ethers.BigNumberish,
    _params: string | ethers.utils.BytesLike
  ) => TransactionWrapper<ethers.Overrides>;
  /**
   * ```solidity
   * function payBackFlashLoan(address,bytes) returns (address[])
   * ```
   *
   */
  payBackFlashLoan: (
    _gateway: string,
    _callArgs: string | ethers.utils.BytesLike
  ) => TransactionWrapper<ethers.Overrides>;
  /**
   * ```solidity
   * function takeFlashLoan(address,bytes) returns (address[])
   * ```
   *
   */
  takeFlashLoan: (
    _gateway: string,
    _callArgs: string | ethers.utils.BytesLike
  ) => TransactionWrapper<ethers.Overrides>;
}
