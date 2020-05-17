export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Adapter = {
   __typename?: 'Adapter';
  id: Scalars['ID'];
  adapter: Scalars['String'];
  gateway: Scalars['String'];
};

export type AdapterFilter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  adapter?: Maybe<Scalars['String']>;
  adapter_not?: Maybe<Scalars['String']>;
  adapter_gt?: Maybe<Scalars['String']>;
  adapter_lt?: Maybe<Scalars['String']>;
  adapter_gte?: Maybe<Scalars['String']>;
  adapter_lte?: Maybe<Scalars['String']>;
  adapter_in?: Maybe<Array<Scalars['String']>>;
  adapter_not_in?: Maybe<Array<Scalars['String']>>;
  adapter_contains?: Maybe<Scalars['String']>;
  adapter_not_contains?: Maybe<Scalars['String']>;
  adapter_starts_with?: Maybe<Scalars['String']>;
  adapter_not_starts_with?: Maybe<Scalars['String']>;
  adapter_ends_with?: Maybe<Scalars['String']>;
  adapter_not_ends_with?: Maybe<Scalars['String']>;
  gateway?: Maybe<Scalars['String']>;
  gateway_not?: Maybe<Scalars['String']>;
  gateway_gt?: Maybe<Scalars['String']>;
  gateway_lt?: Maybe<Scalars['String']>;
  gateway_gte?: Maybe<Scalars['String']>;
  gateway_lte?: Maybe<Scalars['String']>;
  gateway_in?: Maybe<Array<Scalars['String']>>;
  gateway_not_in?: Maybe<Array<Scalars['String']>>;
  gateway_contains?: Maybe<Scalars['String']>;
  gateway_not_contains?: Maybe<Scalars['String']>;
  gateway_starts_with?: Maybe<Scalars['String']>;
  gateway_not_starts_with?: Maybe<Scalars['String']>;
  gateway_ends_with?: Maybe<Scalars['String']>;
  gateway_not_ends_with?: Maybe<Scalars['String']>;
};

export enum AdapterOrderBy {
  ID = 'id',
  ADAPTER = 'adapter',
  GATEWAY = 'gateway'
}



export type BlockHeight = {
  hash?: Maybe<Scalars['Bytes']>;
  number?: Maybe<Scalars['Int']>;
};


export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export type Query = {
   __typename?: 'Query';
  adapter?: Maybe<Adapter>;
  adapters: Array<Adapter>;
  stacker?: Maybe<Stacker>;
  stackers: Array<Stacker>;
};


export type QueryAdapterArgs = {
  id: Scalars['ID'];
  block?: Maybe<BlockHeight>;
};


export type QueryAdaptersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<AdapterOrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<AdapterFilter>;
  block?: Maybe<BlockHeight>;
};


export type QueryStackerArgs = {
  id: Scalars['ID'];
  block?: Maybe<BlockHeight>;
};


export type QueryStackersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<StackerOrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<StackerFilter>;
  block?: Maybe<BlockHeight>;
};

export type Stacker = {
   __typename?: 'Stacker';
  id: Scalars['ID'];
  adapters: Array<Adapter>;
  counter: Scalars['Int'];
};


export type StackerAdaptersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<AdapterOrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<AdapterFilter>;
};

export type StackerFilter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  adapters?: Maybe<Array<Scalars['String']>>;
  adapters_not?: Maybe<Array<Scalars['String']>>;
  adapters_contains?: Maybe<Array<Scalars['String']>>;
  adapters_not_contains?: Maybe<Array<Scalars['String']>>;
  counter?: Maybe<Scalars['Int']>;
  counter_not?: Maybe<Scalars['Int']>;
  counter_gt?: Maybe<Scalars['Int']>;
  counter_lt?: Maybe<Scalars['Int']>;
  counter_gte?: Maybe<Scalars['Int']>;
  counter_lte?: Maybe<Scalars['Int']>;
  counter_in?: Maybe<Array<Scalars['Int']>>;
  counter_not_in?: Maybe<Array<Scalars['Int']>>;
};

export enum StackerOrderBy {
  ID = 'id',
  ADAPTERS = 'adapters',
  COUNTER = 'counter'
}

export type Subscription = {
   __typename?: 'Subscription';
  adapter?: Maybe<Adapter>;
  adapters: Array<Adapter>;
  stacker?: Maybe<Stacker>;
  stackers: Array<Stacker>;
};


export type SubscriptionAdapterArgs = {
  id: Scalars['ID'];
  block?: Maybe<BlockHeight>;
};


export type SubscriptionAdaptersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<AdapterOrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<AdapterFilter>;
  block?: Maybe<BlockHeight>;
};


export type SubscriptionStackerArgs = {
  id: Scalars['ID'];
  block?: Maybe<BlockHeight>;
};


export type SubscriptionStackersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<StackerOrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<StackerFilter>;
  block?: Maybe<BlockHeight>;
};
