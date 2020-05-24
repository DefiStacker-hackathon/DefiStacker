import * as Types from '../../subgraph';

import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type SubgraphQueryVariables = {};


export type SubgraphQuery = (
  { __typename?: 'Query' }
  & { adapters: Array<(
    { __typename?: 'Adapter' }
    & Pick<Types.Adapter, 'id' | 'gateway'>
  )>, stackers: Array<(
    { __typename?: 'Stacker' }
    & Pick<Types.Stacker, 'id'>
  )> }
);


export const SubgraphDocument = gql`
    query subgraph {
  adapters {
    id
    gateway
  }
  stackers {
    id
  }
}
    `;

export function useSubgraphQuery(options: Omit<Urql.UseQueryArgs<SubgraphQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<SubgraphQuery>({ query: SubgraphDocument, ...options });
};