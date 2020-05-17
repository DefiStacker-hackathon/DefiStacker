export interface Adapter {
  kind: AdapterKind;
  method: AdapterMethod;
  args: Array<string>;
  outcome: boolean;
};

export enum AdapterKind {
  AAVE = "aave",
  KYBER = "kyber",
  UNISWAP_1 = "uniswap_1",
  UNISWAP_2 = "uniswap_2",
};

export interface AdapterMethod {
  label: string;
  raw: any;
  parameters: Array<string>;
  description: string;
};

export function createAdapter(
  kind: AdapterKind,
  method: AdapterMethod,
  args: Array<string>,
  outcome: boolean = true
): Adapter {
  const adapter: Adapter = {
    kind: kind,
    method: method,
    args: args,
    outcome: outcome
  };
  return adapter;
}

export function cloneAdapter(
  _adapter: Adapter,
  kind?: AdapterKind,
  method?: AdapterMethod,
  args?: Array<string>,
  outcome?: boolean
): Adapter {
  const adapter = _adapter;
  if (kind) {
    adapter.kind = kind;
  }
  if (method) {
    adapter.method = method;
  }
  if (args) {
    adapter.args = args;
  }
  if (outcome) {
    adapter.outcome = outcome;
  }
  return adapter;
};

export function getAbiFunction(abi: Array<any>, name: string): Object {
  return abi.filter((obj) => {
    return (obj["type"] === "function") && (obj["name"] === name);
  });
}
