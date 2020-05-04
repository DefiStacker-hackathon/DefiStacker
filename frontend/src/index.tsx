import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ethers from "ethers";
import { App } from "./App";
import Context from "./context";

const url = "http://localhost:8545";

// Or if you are running the UI version, use this instead:
// const url = "http://localhost:7545"

const provider = new ethers.providers.JsonRpcProvider(url);
const ctx = { provider };

export const EthersContext = React.createContext(ctx);

ReactDOM.render(
  <Context.Provider value={ctx}>
    <App />
  </Context.Provider>,
  document.getElementById("app")
);
