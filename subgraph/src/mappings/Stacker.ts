import { AdapterAdded, AdapterRemoved } from '../generated/Stacker/Stacker';
import { ensureAdapter } from '../entities/Adapter';
import { ensureStacker } from '../entities/Stacker';
import { arrayUnique } from '../utils/arrayUnique';
import { arrayDiff } from '../utils/arrayDiff';

export function handleAdapterAdded(event: AdapterAdded): void {
  let stacker = ensureStacker(event.address);
  let adapter = ensureAdapter(event.params.adapter, event.params.gateway);

  let adapters = arrayUnique<string>(stacker.adapters.concat([adapter.id]));
  stacker.adapters = adapters;
  stacker.save();
}

export function handleAdapterRemoved(event: AdapterRemoved): void {
  let stacker = ensureStacker(event.address);
  let adapter = ensureAdapter(event.params.adapter, event.params.gateway);

  let adapters = arrayDiff<string>(stacker.adapters, [adapter.id]);
  stacker.adapters = adapters;
  stacker.save();
}
