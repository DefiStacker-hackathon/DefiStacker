import * as Types from '../../subgraph';

import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type TestQueryQueryVariables = {};


export type TestQueryQuery = (
  { __typename?: 'Query' }
  & { adapters: Array<(
    { __typename?: 'Adapter' }
    & Pick<Types.Adapter, 'id'>
  )>, stackers: Array<(
    { __typename?: 'Stacker' }
    & Pick<Types.Stacker, 'id'>
  )> }
);


export const TestQueryDocument = gql`
    query testQuery {
  adapters {
    id
  }
  stackers {
    id
  }
}
    `;

export function useTestQueryQuery(options: Omit<Urql.UseQueryArgs<TestQueryQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<TestQueryQuery>({ query: TestQueryDocument, ...options });
};