import React from 'react';
import * as ethers from 'ethers';
import { Adapter } from './lib/adapters/adapter';
import { Graph, Node } from './lib/graph';
import { startNewPipeline, addAdapter } from './lib/pipeline';
import { takeFlashLoan } from './lib/adapters/aave';
import {
  createAdapter,
  createBlankAdapter,
  AdapterKind,
} from './lib/adapters/adapter';
import { getProvider } from './utils/metamask';

interface State {
  provider: ethers.ethers.providers.JsonRpcProvider;
  pipeline: Graph<Node<Adapter>, number>;
}

type Action =
  | { type: 'init' }
  | { type: 'connect' }
  | { type: 'add' }
  | { type: 'add_blank' }
  | { type: 'delete' }
  | { type: 'update' };
type Dispatch = (action: Action) => void;
type PipelineProviderProps = { children: React.ReactNode };

const PipelineStateContext = React.createContext<State | undefined>(undefined);
const PipelineDispatchContext = React.createContext<Dispatch | undefined>(
  undefined,
);

function pipelineReducer(state: State, action: Action) {
  switch (action.type) {
    // Connect to web3 provider
    case 'connect': {
      return { ...state, provider: getProvider() };
    }
    // Initialize a new pipeline
    case 'init': {
      return { ...state, pipeline: startNewPipeline() };
    }
    // Add a new blank to the pipeline that will be rendered as a form
    case 'add_blank': {
      if (!state.pipeline) throw new Error('Pipeline not initialized');
      const BlankAdapter = createBlankAdapter();
      const { pipeline, adapterId } = addAdapter(state.pipeline, BlankAdapter);
      return { ...state, pipeline };
    }
    // Add new adapter to the pipeline
    case 'add': {
      if (!state.pipeline) throw new Error('Pipeline not initialized');
      const { pipeline, adapterId } = addAdapter(
        state.pipeline,
        createAdapter(AdapterKind.AAVE, takeFlashLoan, []),
      );
      console.log(1);
      return { ...state, pipeline };
    }
    // Delete an adapter from the pipeline
    case 'delete': {
      // TODO
      return { ...state };
    }
    // Update an adapter in the pipeline
    case 'update': {
      // TODO
      return { ...state };
    }
    default: {
      throw new Error(`Unhandled action type`);
    }
  }
}

function PipelineProvider({ children }: PipelineProviderProps) {
  const [state, dispatch] = React.useReducer(pipelineReducer, {
    provider: null,
    pipeline: null,
  });
  return (
    <PipelineStateContext.Provider value={state}>
      <PipelineDispatchContext.Provider value={dispatch}>
        {children}
      </PipelineDispatchContext.Provider>
    </PipelineStateContext.Provider>
  );
}

function usePipelineState() {
  const context = React.useContext(PipelineStateContext);
  if (context === undefined) {
    throw new Error('usePipelineState must be used within a PipelineProvider');
  }
  return context;
}

function usePipelineDispatch() {
  const context = React.useContext(PipelineDispatchContext);
  if (context === undefined) {
    throw new Error(
      'usePipelineDispatch must be used within a PipelineProvider',
    );
  }
  return context;
}

function usePipeline(): [State, Dispatch] {
  return [usePipelineState(), usePipelineDispatch()];
}

export { PipelineProvider, usePipelineState, usePipelineDispatch, usePipeline };
