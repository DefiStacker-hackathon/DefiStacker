import { ethers } from 'ethers';
import { Contract, TransactionWrapper } from './Contract';

export class Stacker extends Contract {
  /**
   * The contract abis.
   */
  public static readonly abi: string[] = [
    'event AdapterAdded(address adapter, address gateway)',
    'event AdapterRemoved(address adapter, address gateway)',
    'event CallExecuted(uint256 stackId, address callAdapter, string callSig, bytes callArgs, address[] incomingAssets, uint256[] incomingAmounts, address[] outgoingAssets, uint256[] outgoingAmounts)',
    'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
    'event StackExecuted(address indexed sender, uint256 stackId, address[] spendAssets, uint256[] spendAssetBalances, address[] callAdapters, string[] callSigs, bytes[] callArgs, address[] paidOutAssets, uint256[] paidOutAmounts)',
    'function ETH_ADDRESS() view returns (address)',
    'function adapterToGateway(address) view returns (address)',
    'function owner() view returns (address)',
    'function renounceOwnership()',
    'function stackId() view returns (uint256)',
    'function transferOwnership(address newOwner)',
    'function addAdapter(address _adapter, address _gateway)',
    'function executeStackNoPayout(address[] _spendAssets, uint256[] _spendAssetBalances, address[] _callAdapters, string[] _callSigs, bytes[] _callArgs) payable',
    'function executeStack(address[] _spendAssets, uint256[] _spendAssetBalances, address[] _callAdapters, string[] _callSigs, bytes[] _callArgs) payable',
    'function removeAdapter(address _adapter)',
  ];
  /**
   * ```solidity
   * function ETH_ADDRESS() view returns (address)
   * ```
   *
   */
  ETH_ADDRESS: ($$overrides?: ethers.CallOverrides) => Promise<string>;
  /**
   * ```solidity
   * function adapterToGateway(address) view returns (address)
   * ```
   *
   */
  adapterToGateway: (
    $$0: string,
    $$overrides?: ethers.CallOverrides,
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
   * function stackId() view returns (uint256)
   * ```
   *
   */
  stackId: ($$overrides?: ethers.CallOverrides) => Promise<ethers.BigNumber>;
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
    _gateway: string,
  ) => TransactionWrapper<ethers.Overrides>;
  /**
   * ```solidity
   * function executeStackNoPayout(address[],uint256[],address[],string[],bytes[]) payable
   * ```
   *
   */
  executeStackNoPayout: (
    _spendAssets: string[],
    _spendAssetBalances: ethers.BigNumber[],
    _callAdapters: string[],
    _callSigs: string[],
    _callArgs: string | ethers.utils.BytesLike,
  ) => TransactionWrapper<ethers.PayableOverrides>;
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
    _callArgs: string | ethers.utils.BytesLike,
  ) => TransactionWrapper<ethers.PayableOverrides>;
  /**
   * ```solidity
   * function removeAdapter(address)
   * ```
   *
   */
  removeAdapter: (_adapter: string) => TransactionWrapper<ethers.Overrides>;
}
