import React from "react";
import * as ethers from "ethers";

interface Context {
  provider: ethers.ethers.providers.JsonRpcProvider;
}

const context = {} as Context;

const MyContext = React.createContext(context);

export default MyContext;
