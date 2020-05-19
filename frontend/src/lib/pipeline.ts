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

  pipeline.incomingAdjacency.set(nodeKey, incoming);
  outgoing.forEach(key => {
    const outgoingList = pipeline.incomingAdjacency.get(key);
    outgoingList.push(nodeKey);
  });

  return { pipeline: pipeline, adapterId: nodeKey };
}