import React from 'react';
import * as ethers from 'ethers';
import { Graph, Node } from './lib/graph';
import {
  startNewPipeline,
  addAdapter,
  updateAdapter,
  removeAdapter,
} from './lib/pipeline';
import {
  Adapter,
  createBlankAdapter,
  createAdapter,
  AdapterKind,
  AdapterMethod,
} from './lib/adapters/adapter';
import * as erc20 from './utils/erc20';
import * as tokens from './utils/tokens';
import { getProvider, sendEth } from './utils/metamask';
import { Contracts, initializeContracts } from './utils/contracts';
import { SubgraphQuery } from './graphql/queries/subgraph.queries';

interface State {
  provider: ethers.providers.Web3Provider;
  pipeline: Graph<Node<Adapter>, number>;
  contracts: Contracts;
}

type Action =
  | { type: 'connect' }
  | { type: 'initContracts'; data: SubgraphQuery }
  | { type: 'initBlankPipeline' }
  | { type: 'get_dai' }
  | { type: 'get_stacker_dai' }
  | { type: 'send_eth'; to: string; amountInEth: string }
  | {
      type: 'approve';
      tokenSymbol: string;
      amountInWei: string;
    }
  | { type: 'add_blank'; incoming: number[]; outgoing: number[] }
  | {
      type: 'move';
      id: number;
      to: { incoming: number[]; outgoing: number[] };
    }
  | {
      type: 'update';
      id: number;
      kind: AdapterKind;
      method: AdapterMethod;
      args: Array<string>;
    }
  | { type: 'delete'; id: number };
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
      const provider = getProvider();
      return { ...state, provider: provider };
    }
    // Initialize deployed contracts
    case 'initContracts': {
      const { data } = action;
      const contracts = initializeContracts(data, state.provider);
      return { ...state, contracts };
    }
    // Send eth
    case 'send_eth': {
      const provider = getProvider();
      const { to, amountInEth } = action;
      sendEth(provider, to, amountInEth);
      return state;
    }
    // Initialize a new pipeline
    case 'initBlankPipeline': {
      return {
        ...state,
        pipeline: startNewPipeline(),
      };
    }
    // Transfer dai to account
    case 'get_dai': {
      const provider = getProvider();
      erc20.getInitialDai(provider);
      return state;
    }
    case 'get_stacker_dai': {
      const provider = getProvider();
      erc20.getDaiFromStacker(provider);
      return state;
    }
    // Add a new fund adapter to the pipeline
    case 'approve': {
      console.log('state', state);
      if (!state.pipeline) throw new Error('Pipeline not initialized');
      const { tokenSymbol, amountInWei } = action;
      if (tokenSymbol == tokens.DAI.ticker) {
        erc20.approveDai(state.provider, amountInWei);
      }
      return state;
    }
    // Add a new blank to the pipeline that will be rendered as a form
    case 'add_blank': {
      if (!state.pipeline) throw new Error('Pipeline not initialized');
      const { incoming, outgoing } = action;
      const BlankAdapter = createBlankAdapter();
      const { pipeline } = addAdapter(
        state.pipeline,
        BlankAdapter,
        incoming,
        outgoing,
      );
      return { ...state, pipeline };
    }
    // Move an adapter in the pipeline to a new index
    case 'move': {
      if (!state.pipeline) throw new Error('Pipeline not initialized');
      const {
        id,
        to: { incoming, outgoing },
      } = action;
      const { kind, method, args } = state.pipeline.nodes.get(id).value;
      const newAdapter = createAdapter(kind, method, args);
      const { pipeline: pipelineWithoutAdapter } = removeAdapter(
        state.pipeline,
        id,
      );
      const { pipeline } = addAdapter(
        pipelineWithoutAdapter,
        newAdapter,
        incoming,
        outgoing,
      );
      return { ...state, pipeline };
    }
    // Delete an adapter from the pipeline
    case 'delete': {
      if (!state.pipeline) throw new Error('Pipeline not initialized');
      const { id } = action;
      const { pipeline } = removeAdapter(state.pipeline, id);
      return { ...state, pipeline };
    }
    // Update an adapter in the pipeline
    case 'update': {
      if (!state.pipeline) throw new Error('Pipeline not initialized');
      const { id, kind, method, args } = action;
      const { pipeline } = updateAdapter(
        state.pipeline,
        id,
        kind,
        method,
        args,
      );
      return { ...state, pipeline };
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
    contracts: null,
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
