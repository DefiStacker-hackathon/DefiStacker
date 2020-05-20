import { Graph, Node, createGraph, createNode, addNode, updateNode, removeNode, addAdjacency } from "./graph";
import { Adapter, AdapterKind, AdapterMethod, cloneAdapter } from "./adapters/adapter";

export function startNewPipeline(): Graph<Node<Adapter>, number>{
  return createGraph();
}

// TODO
// export function createPipelineFromTemplate(serializedPipeline: string): Graph<Node<Adapter>, number>{
//   let pipeline = JSON.parse(serializedPipeline);
//   return;
// }

export function serializePipeline(pipeline: Graph<Node<Adapter>, number>): string {
  return JSON.stringify(pipeline);
}

export function addAdapterToPipeline(
  pipeline: Graph<Node<Adapter>, number>,
  adapter: Adapter,
  incoming: Array<number> = [],
  outgoing: Array<number> = []
): any {
  const node = createNode(adapter);
  const nodeKey = Date.now() + pipeline.nodes.size;

  pipeline = addNode(pipeline, nodeKey, node);
  incoming.forEach(inKey => {
    pipeline = addAdjacency(pipeline, inKey, nodeKey);
  });
  outgoing.forEach(outKey => {
    pipeline = addAdjacency(pipeline, nodeKey, outKey);
  });

  return { pipeline: pipeline, adapterId: nodeKey };
}

export function updateAdapter(
  pipeline: Graph<Node<Adapter>, number>,
  nodeKey: number,
  adapter: Adapter,
  kind?: AdapterKind,
  method?: AdapterMethod,
  args?: Array<string>
): any {
  adapter = cloneAdapter(adapter, kind, method, args);
  pipeline = updateNode(pipeline, nodeKey, adapter);
  return { pipeline: pipeline, adapterId: nodeKey };
}

export function removeAdapter(
  pipeline: Graph<Node<Adapter>, number>,
  nodeKey: number
): any {

  const incoming: Array<number> = pipeline.incomingAdjacency.get(nodeKey);
  const outgoing: Array<number> = [];
  pipeline.incomingAdjacency.forEach((list, key) => {
    if (list.indexOf(nodeKey) > -1) {
      outgoing.push(key);
    }
  });

  // Remap incoming to outgoing of the removed adapter
  pipeline = removeNode(pipeline, nodeKey);
  incoming.forEach((inKey) => {
    outgoing.forEach((outKey) => {
      pipeline = addAdjacency(pipeline, inKey, outKey);
    });
  });

  return { pipeline: pipeline, adapterId: nodeKey };
}