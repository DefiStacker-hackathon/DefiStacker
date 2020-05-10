export interface Graph<Node, NodeValue> {
  nodes: Array<Node>;
  edges: Array<Edge<NodeValue>>;
};

export interface Edge<T> {
  source: Node<T>;
  destination: Node<T>;
  requiredOutcome: boolean;
};

export interface Node<T> {
  value: T
};

// TODO: I think for now it's a good idea to start with simple
// serialization but the size will quickly become larger than needed
// so we should slim this down.

export const serializeNode = function(node: Node<any>): string {
  return JSON.stringify(node);
}

export const serializeEdge = function(edge: Edge<any>): string {
  return JSON.stringify(edge)
}

export const getTopologicalSortOrder = function(
  graph: Graph<Node<any>, any>
): Array<Node<any>> {
  // TODO
  return graph.nodes;
}

export const getRoot = function(
  graph: Graph<Node<any>, any>
): Node<any> {
  // TODO
  return graph.nodes[0];
}
