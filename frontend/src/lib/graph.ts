import produce from "immer";

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

export function createGraph<T>(): Graph<Node<T>, T> {
  const graph: Graph<Node<T>, T> = {nodes: [], edges: []};
  return graph;
}

export function cloneGraph<T>(graph: Graph<Node<T>, T>): Graph<Node<T>, T> {
  return produce(graph, draft => {});
}

export function createEdge<T>(
  source: Node<T>,
  destination: Node<T>,
  requiredOutcome: boolean,
): Edge<T> {
  const edge: Edge<T> = {
    source: source,
    destination: destination,
    requiredOutcome: requiredOutcome
  };
  return edge;
}

export function createNode<T>(value: T): Node<T> {
  const node: Node<T> = {
    value: value,
  };
  return node;
}

/**
 * Returns a clone of `graph` with `edge` added to the graph's edges
 * @param graph
 * @param edge
 */
export function addEdge<T>(
  graph: Graph<Node<T>, T>,
  edge: Edge<T>
): Graph<Node<T>, T> {
  return produce<Graph<Node<T>, T>, Graph<Node<T>, T>>(graph, draft => {
    draft.edges.push(edge);
  });
}

/**
 * Returns a clone of `graph` with `node` added to the graph's nodes
 * @param graph
 * @param node
 */
export function addNode<T>(
  graph: Graph<Node<T>, T>,
  node: Node<T> 
): Graph<Node<T>, T> {
  return produce<Graph<Node<T>, T>, Graph<Node<T>, T>>(graph, draft => {
    draft.nodes.push(node);
  });
}


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
