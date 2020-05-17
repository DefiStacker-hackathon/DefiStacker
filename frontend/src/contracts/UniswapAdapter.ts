import { ethers } from "ethers";
import { Contract, TransactionWrapper } from "./Contract";

export class UniswapAdapter extends Contract {
  /**
   * The contract abis.
   */
  public static readonly abi: string[] = [
    "function takeOrder(address _gateway, bytes _callArgs) payable returns (address[] receivedAssets)",
  ];
  /**
   * ```solidity
   * function takeOrder(address,bytes) payable returns (address[])
   * ```
   *
   */
  takeOrder: (
    _gateway: string,
    _callArgs: string | ethers.utils.BytesLike
  ) => TransactionWrapper<ethers.PayableOverrides>;
}
