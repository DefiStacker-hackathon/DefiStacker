import { Address } from '@graphprotocol/graph-ts';
import { Adapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useAdapter(id: string): Adapter {
  let adapter = Adapter.load(id);
  if (adapter == null) {
    logCritical('Failed to load adapter {}.', [id]);
  }

  return adapter as Adapter;
}

export function createAdapter(address: Address, gateway: Address): Adapter {
  let adapter = Adapter.load(address.toHex()) as Adapter;
  if (adapter) {
    return adapter;
  }

  adapter = new Adapter(address.toHex());
  adapter.adapter = address.toHex();
  adapter.gateway = gateway.toHex();
  adapter.save();

  return adapter;
}

export function ensureAdapter(address: Address, gateway: Address): Adapter {
  let adapter = Adapter.load(address.toHex()) as Adapter;
  if (adapter) {
    return adapter;
  }

  return createAdapter(address, gateway);
}
