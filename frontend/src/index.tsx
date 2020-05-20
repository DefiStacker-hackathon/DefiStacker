import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import { PipelineProvider } from './context';
import { createClient, Provider } from 'urql';

const subgraph = createClient({
  url: 'http://localhost:8000/subgraphs/name/defistacker/defistacker',
});

ReactDOM.render(
  <Provider value={subgraph}>
    <PipelineProvider>
      <App />
    </PipelineProvider>
  </Provider>,
  document.getElementById('app'),
);
