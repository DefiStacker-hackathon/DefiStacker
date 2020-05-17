import { AdapterMethod, getAbiFunction } from "./adapter";
import AaveAdapterJson from "../../build/contracts/AaveAdapter.json";

// TODO: takeFlashLoan requires all other adapter method parameters
// to be nested inside its own parameters. We need a way to represent
// and handle that.
export const takeFlashLoan = <AdapterMethod>{
    label: "takeFlashLoan",
    raw: getAbiFunction(AaveAdapterJson.abi, "takeFlashLoan"),
    parameters: ["tokenYouWant", "amountYouWant"],
    description: "Borrow the requested token and repay the full amount in a single transaction",
};

export const payBackFlashLoan = <AdapterMethod>{
  label: "payBackFlashLoan",
  raw: getAbiFunction(AaveAdapterJson.abi, "payBackFlashLoan"),
  parameters: ["", "tokenYouBorrowed", "amountDue"],
  description: "Repay the borrowed flash loan amount",
};
