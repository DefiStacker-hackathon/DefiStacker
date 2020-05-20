import { Graph, Node, createGraph, createNode, addNode, updateNode, removeNode, addAdjacency, clearAdjacency, getTopologicalSortOrder } from "./graph";
import { Adapter, AdapterKind, AdapterMethod, cloneAdapter } from "./adapters/adapter";

/**
 * Creates a new pipeline with no adapters.
 */
export function startNewPipeline(): Graph<Node<Adapter>, number>{
  return createGraph();
}

/**
 * Returns a new pipeline with the adapter added and the added adapter's id.
 * @param pipeline 
 * @param adapter 
 * @param incoming Ids for adapters that should point to the added adapter
 * @param outgoing Ids for adapters that the added adapter should point to
 */
export function addAdapter(
  pipeline: Graph<Node<Adapter>, number>,
  adapter: Adapter,
  incoming: Array<number> = [],
  outgoing: Array<number> = []
): any {
  const node = createNode(adapter);
  const nodeKey = Date.now() + pipeline.nodes.size;

  pipeline = addNode(pipeline, nodeKey, node);
  incoming.forEach(inKey => {
    pipeline = clearAdjacency(pipeline, inKey);
    pipeline = addAdjacency(pipeline, inKey, nodeKey);
  });
  outgoing.forEach(outKey => {
    pipeline = addAdjacency(pipeline, nodeKey, outKey);
  });


  return { pipeline: pipeline, adapterId: nodeKey };
}

/**
 * Returns a clone of `pipeline` with the adapter of id `id` modified.
 * @param pipeline 
 * @param id Id of the the adapter to update.
 * @param kind
 * @param method
 * @param args
 */
export function updateAdapter(
  pipeline: Graph<Node<Adapter>, number>,
  id: number,
  kind?: AdapterKind,
  method?: AdapterMethod,
  args?: Array<string>
): any {
  let adapter = pipeline.nodes.get(id).value;
  adapter = cloneAdapter(adapter, kind, method, args);
  pipeline = updateNode(pipeline, id, adapter);
  return { pipeline: pipeline, adapterId: id };
}

export function removeAdapter(
  pipeline: Graph<Node<Adapter>, number>,
  id: number
): any {

  const incoming: Array<number> = pipeline.incomingAdjacency.get(id);
  const outgoing: Array<number> = [];
  pipeline.incomingAdjacency.forEach((list, key) => {
    if (list.indexOf(id) > -1) {
      outgoing.push(key);
    }
  });

  // Remap incoming to outgoing of the removed adapter
  pipeline = removeNode(pipeline, id);
  incoming.forEach((inKey) => {
    outgoing.forEach((outKey) => {
      pipeline = addAdjacency(pipeline, inKey, outKey);
    });
  });

  return { pipeline: pipeline, adapterId: id };
}

export function serializePipeline(pipeline: Graph<Node<Adapter>, number>): string {
  return JSON.stringify({
    "adapters": [
      ...pipeline.nodes
    ],
    "incomingAdjacency": [
      ...pipeline.incomingAdjacency
    ],
  });
}

/**
 * Returns a pipeline object based on the `serialized` version.
 * @param serialized The stringified pipeline.
 */
export function deserializePipeline(serialized: string): Graph<Node<Adapter>, number>{
  let pipeline = JSON.parse(serialized);
  return {
    nodes: new Map(pipeline["adapters"]),
    incomingAdjacency: new Map(pipeline["incomingAdjacency"]),
  };
}