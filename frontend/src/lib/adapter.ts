export interface Adapter {
  kind: AdapterKind;
  parameters: Array<string>;
  arguments: Array<string>;
  outcome: boolean;
};

export enum AdapterKind {
  KYBER = "kyber",
  UNISWAP = "uniswap",
};
