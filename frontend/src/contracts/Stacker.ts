import { ethers } from "ethers";
import { Contract, TransactionWrapper } from "./Contract";

export class Stacker extends Contract {
  /**
   * The contract abis.
   */
  public static readonly abi: string[] = [
    "event AdapterAdded(address adapter, address gateway)",
    "event AdapterRemoved(address adapter, address gateway)",
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
    "function adapterToGateway(address) view returns (address)",
    "function owner() view returns (address)",
    "function renounceOwnership()",
    "function transferOwnership(address newOwner)",
    "function addAdapter(address _adapter, address _gateway)",
    "function executeStack(address[] _spendAssets, uint256[] _spendAssetBalances, address[] _callAdapters, string[] _callSigs, bytes[] _callArgs) payable",
    "function removeAdapter(address _adapter)",
  ];
  /**
   * ```solidity
   * function adapterToGateway(address) view returns (address)
   * ```
   *
   */
  adapterToGateway: (
    $$0: string,
    $$overrides?: ethers.CallOverrides
  ) => Promise<string>;
  /**
   * ```solidity
   * function owner() view returns (address)
   * ```
   *
   */
  owner: ($$overrides?: ethers.CallOverrides) => Promise<string>;
  /**
   * ```solidity
   * function renounceOwnership()
   * ```
   *
   */
  renounceOwnership: () => TransactionWrapper<ethers.Overrides>;
  /**
   * ```solidity
   * function transferOwnership(address)
   * ```
   *
   */
  transferOwnership: (newOwner: string) => TransactionWrapper<ethers.Overrides>;
  /**
   * ```solidity
   * function addAdapter(address,address)
   * ```
   *
   */
  addAdapter: (
    _adapter: string,
    _gateway: string
  ) => TransactionWrapper<ethers.Overrides>;
  /**
   * ```solidity
   * function executeStack(address[],uint256[],address[],string[],bytes[]) payable
   * ```
   *
   */
  executeStack: (
    _spendAssets: string[],
    _spendAssetBalances: ethers.BigNumber[],
    _callAdapters: string[],
    _callSigs: string[],
    _callArgs: string | ethers.utils.BytesLike
  ) => TransactionWrapper<ethers.PayableOverrides>;
  /**
   * ```solidity
   * function removeAdapter(address)
   * ```
   *
   */
  removeAdapter: (_adapter: string) => TransactionWrapper<ethers.Overrides>;
}
