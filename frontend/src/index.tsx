import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ethers from 'ethers';
import { App } from './App';
import Context from './context';
import { createClient, Provider } from 'urql';

const client = createClient({
  url: 'http://localhost:8000/subgraphs/name/defistacker/defistacker',
});

const url = 'http://localhost:8545';

// Or if you are running the UI version, use this instead:
// const url = "http://localhost:7545"

const provider = new ethers.providers.JsonRpcProvider(url);
const ctx = { provider };

export const EthersContext = React.createContext(ctx);

ReactDOM.render(
  <Provider value={client}>
    <Context.Provider value={ctx}>
      <App />
    </Context.Provider>
  </Provider>,
  document.getElementById('app'),
);
