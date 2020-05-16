import { AdapterMethod, getAbiFunction } from "./adapter";
import KyberAdapterJson from "../../build/contracts/KyberAdapter.json";

export const swap = <AdapterMethod>{
    label: "swap",
    raw: getAbiFunction(KyberAdapterJson.abi, "takeOrder"),
    parameters: ["gatewayAddress", ["tokenYouHave", "amountToSwap", "tokenYouWant"]],
    description: "Swaps the token you have for the token you want",
};
