import { AdapterMethod, getAbiFunction } from "./adapter";
import UniswapAdapterJson from "../../build/contracts/UniswapAdapter.json";

export const swap = <AdapterMethod>{
    label: "swap",
    raw: getAbiFunction(UniswapAdapterJson.abi, "takeOrder"),
    parameters: ["gatewayAddress", ["tokenYouHave", "amountToSwap", "tokenYouWant"]],
    description: "Swaps the token you have for the token you want",
};
