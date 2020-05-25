import { SubgraphQuery } from '../graphql/queries/subgraph.queries';
import { AaveAdapter } from '../contracts/AaveAdapter';
import { KyberAdapter } from '../contracts/KyberAdapter';
import { UniswapAdapter } from '../contracts/UniswapAdapter';
import { Stacker } from '../contracts/Stacker';
import * as ethers from 'ethers';

const GATEWAY_ADDRESSES: { [name: string]: string } = {
  '0x24a42fd28c976a61df5d00d0599c34c4f90748c8': 'AAVE',
  '0x818e6fecd516ecc3849daf6845e3ec868087b755': 'KYBER',
  '0xc0a47dfe034b400b47bdad5fecda2621de6c4d95': 'UNISWAP',
};

export interface Contracts {
  AAVE: AaveAdapter;
  KYBER: KyberAdapter;
  UNISWAP_1: UniswapAdapter;
  STACKER: Stacker;
}

export function initializeContracts(
  data: SubgraphQuery,
  provider: ethers.ethers.providers.JsonRpcProvider,
): Contracts {
  if (!data) return null;
  const { adapters, stackers } = data;
  const adapterMap: { [name: string]: string } = {};
  adapters.forEach((adapter) => {
    adapterMap[GATEWAY_ADDRESSES[adapter.gateway]] = adapter.id;
  });
  return {
    AAVE: new AaveAdapter(adapterMap['AAVE'], provider),
    KYBER: new KyberAdapter(adapterMap['AAVE'], provider),
    UNISWAP_1: new UniswapAdapter(adapterMap['AAVE'], provider),
    STACKER: new Stacker(stackers && stackers[0].id, provider),
  };
}
