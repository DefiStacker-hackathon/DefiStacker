import { ethers } from "ethers";

export class TransactionWrapper<
  TOverrides extends ethers.Overrides = ethers.Overrides
> {
  constructor(
    public readonly contract: Contract,
    public readonly signature: string,
    public readonly args?: any[]
  ) {}

  public populate(overrides?: TOverrides): Promise<ethers.UnsignedTransaction> {
    return this.contract.$$ethers.populateTransaction[this.signature](
      ...this.args,
      overrides || {}
    );
  }

  public call(overrides?: ethers.CallOverrides): Promise<any> {
    return this.contract.$$ethers.callStatic[this.signature](
      ...this.args,
      overrides || {}
    );
  }

  public estimate(overrides?: TOverrides): Promise<ethers.BigNumber> {
    return this.contract.$$ethers.estimateGas[this.signature](
      ...this.args,
      overrides || {}
    );
  }

  public send(
    overrides?: TOverrides
  ): Promise<ethers.providers.TransactionResponse> {
    return this.contract.$$ethers.functions[this.signature](
      ...this.args,
      overrides || {}
    );
  }
}

export abstract class Contract {
  /**
   * The contract abi.
   */
  public static readonly abi: string[];

  /**
   * Checks if the given object is a contract instance.
   *
   * @param value The suspected contract instance.
   * @returns true if the given value is a contract, false otherwise.
   */
  public static isContract(value: Contract | any): value is Contract {
    if (value instanceof Contract) {
      return true;
    }

    if (
      value.interface &&
      ethers.utils.Interface.isInterface(value.interface)
    ) {
      return true;
    }

    return false;
  }

  /**
   * The contract interface.
   */
  public readonly interface: ethers.utils.Interface;

  /**
   * The underlying ethers.js contract instance.
   */
  public readonly $$ethers: ethers.Contract;

  /**
   * Constructs a new contract instance.
   *
   * @param addressOrName The address or name of the contract.
   * @param signerOrProvider The ethers.js signer or provider instance to use.
   */
  constructor(
    addressOrName: string,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.interface = new ethers.utils.Interface(new.target.abi);

    // TODO: Completely replace the ethers.Contract implementation with a custom
    // version that is more tightly tailored for our use case.
    this.$$ethers = new ethers.Contract(
      ethers.utils.getAddress(addressOrName),
      this.interface,
      signerOrProvider
    );

    const uniques = Object.keys(this.interface.functions).filter(
      (signature, index, array) => {
        const fragment = this.interface.functions[signature];
        return (
          index ===
          array.findIndex(
            (item) =>
              this.$$ethers.interface.functions[item].name === fragment.name
          )
        );
      }
    );

    const calls = uniques.filter((signature) => {
      const fragment = this.interface.functions[signature];
      return fragment.constant;
    });

    const transactions = uniques.filter((signature) => {
      const fragment = this.interface.functions[signature];
      return !fragment.constant;
    });

    calls.forEach((signature) => {
      const fragment = this.interface.functions[signature];
      (this as any)[fragment.name] = this.$$ethers.functions[signature];
    });

    transactions.forEach((signature) => {
      const fragment = this.interface.functions[signature];
      (this as any)[fragment.name] = (...args: any[]) =>
        new TransactionWrapper(this, signature, args);
    });
  }
}
