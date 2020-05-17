import { Graph, Node, createGraph, createNode, addNode } from "./graph";
import { Adapter } from "./adapters/adapter";

export function startNewPipeline(): Graph<Node<Adapter>, number>{
  return createGraph();
}

export function addAdapterToPipeline(
  pipeline: Graph<Node<Adapter>, number>,
  adapter: Adapter,
  incoming: Array<number> = [],
  outgoing: Array<number> = []
): any {
  const node = createNode(adapter);
  const nodeKey = Date.now();

  pipeline = addNode(pipeline, nodeKey, node);

  const incomingNodeKeys = new Map();
  incoming.forEach(key => {
    incomingNodeKeys.set(key, true);
  });
  pipeline.incomingAdjacency.set(nodeKey, incomingNodeKeys);

  outgoing.forEach(key => {
    const outgoingNodeMap = pipeline.incomingAdjacency.get(key);
    outgoingNodeMap.set(nodeKey, true);
  });

  return { pipeline: pipeline, adapterId: nodeKey };
}