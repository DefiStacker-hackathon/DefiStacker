import { Address } from '@graphprotocol/graph-ts';
import { Stacker } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useStacker(id: string): Stacker {
  let stacker = Stacker.load(id);
  if (stacker == null) {
    logCritical('Failed to load stacker {}.', [id]);
  }

  return stacker as Stacker;
}

export function createStacker(address: Address): Stacker {
  let stacker = Stacker.load(address.toHex()) as Stacker;
  if (stacker) {
    return stacker;
  }

  stacker = new Stacker(address.toHex());
  stacker.adapters = [];
  stacker.save();

  return stacker;
}

export function ensureStacker(address: Address): Stacker {
  let stacker = Stacker.load(address.toHex()) as Stacker;
  if (stacker) {
    return stacker;
  }

  return createStacker(address);
}
