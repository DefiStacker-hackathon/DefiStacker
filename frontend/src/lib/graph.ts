import produce, { enableMapSet } from "immer";
enableMapSet();

export interface Graph<Node, T> {
  nodes: Map<T, Node>; // Good to use timestamp as key
  incomingAdjacency: Map<T, Map<T, boolean>>;
};

export interface Node<V> {
  value: V
};

/**
 * Returns a new empty graph.
 */
export function createGraph<T, V>(): Graph<Node<V>, T> {
  const graph: Graph<Node<V>, T> = {
    nodes: new Map(),
    incomingAdjacency: new Map(),
  };
  return graph;
};

/**
 * Returns a new graph with the same values as `graph`.
 * @param graph
 */
export function cloneGraph<T, V>(graph: Graph<Node<V>, T>): Graph<Node<V>, T> {
  return produce(graph, draft => {});
}

/**
 * Returns a new node with value as `value`.
 * @param value 
 */
export function createNode<T>(value: T): Node<T> {
  const node: Node<T> = {
    value: value,
  };
  return node;
}

/**
 * Returns a new node with the same values as `node`.
 * @param node
 */
export function cloneNode<T>(node: Node<T>): Node<T> {
  return produce(node, draff => {});
}

/**
 * Returns a clone of `graph` with `node` added to the graph's nodes
 * @param graph
 * @param node
 */
export function addNode<T, V>(
  graph: Graph<Node<V>, T>,
  key: T,
  node: Node<V> 
): Graph<Node<V>, T> {
  return produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
    draft.nodes.set(key, node);
  });
}

/**
 * Returns keys of nodes in graph that have no incoming edges.
 * @param graph 
 */
export function getIndegree0<T, V>(
  graph: Graph<Node<V>, T>
): Array<T> {
  const indegree0: Array<T> = [];
  for (let [k, v] of graph.incomingAdjacency) {
    if (v == undefined) {
      indegree0.push(k);
    }
  }
  return indegree0;
}
