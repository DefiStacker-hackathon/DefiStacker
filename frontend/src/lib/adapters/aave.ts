import { AdapterMethod } from "./adapter";

// TODO: takeFlashLoan requires all other adapter method parameters
// to be nested inside its own parameters. We need a way to represent
// and handle that.
export const takeFlashLoan = <AdapterMethod>{
    label: "Take out a flash loan",
    parameters: ["token", "amount"],
    parameterDescriptions: ["Token you want to borrow", "Amount you want to borrow"],
    description: "Borrow the requested token and repay the full amount in a single transaction",
};

export const payBackFlashLoan = <AdapterMethod>{
  label: "Pay back your flash loan",
  parameters: ["token", "amount due"],
  parameterDescriptions: ["Token you borrowed", "Amount you owe back"],
  description: "Repay the borrowed flash loan",
};
