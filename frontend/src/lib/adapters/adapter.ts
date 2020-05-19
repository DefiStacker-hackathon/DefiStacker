import produce  from "immer";

import { Contract } from "../../contracts/Contract";

export interface Adapter {
  kind: AdapterKind;
  contract: Contract;
  method: AdapterMethod;
  args: Array<string>;
};

export enum AdapterKind {
  AAVE = "aave",
  KYBER = "kyber",
  UNISWAP_1 = "uniswap_1",
  UNISWAP_2 = "uniswap_2",
};

export interface AdapterMethod {
  label: string;
  parameters: Array<string>;
  parameterDescriptions: Array<string>;
  description: string;
};

export function createAdapter(
  kind: AdapterKind,
  contract: Contract,
  method: AdapterMethod,
  args: Array<string>,
): Adapter {
  return <Adapter>{
    kind: kind,
    contract: contract,
    method: method,
    args: args
  };
}

export function cloneAdapter(
  adapter: Adapter,
  kind?: AdapterKind,
  contract?: Contract,
  method?: AdapterMethod,
  args?: Array<string>
): Adapter {
  return produce<Adapter, Adapter>(adapter, draft => {
    if (kind) {
      draft.kind = kind;
    }
    if (contract) {
      draft.contract = contract;
    }
    if (method) {
      draft.method = method;
    }
    if (args) {
      draft.args = args;
    }
  });
};
