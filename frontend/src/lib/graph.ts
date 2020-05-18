import produce, { enableMapSet } from "immer";

enableMapSet();

type Condition = any; // Any expression that evaluates to true or false

export interface Graph<Node, NodeKey> {
  nodes: Map<NodeKey, Node>; // Helpful to use timestamp as key instead of hash function
  /**
   * The first node key represents a node in the above node map.
   * The second node key represents a node that has an edge pointing
   * to the first node key.
   * Condition is any expression that must be true in order for this
   * edge to be "valid" in the graph.
   */
  incomingAdjacency: Map<NodeKey, Map<NodeKey, Condition>>;
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

export function addAdjacency<T, V>(
  graph: Graph<Node<V>, T>,
  sourceKey: T,
  destinationKey: T,
  condition: Condition = undefined
): Graph<Node<V>, T> {
  if (graph.incomingAdjacency.get(destinationKey) === undefined) {
    graph = produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
      draft.incomingAdjacency.set(destinationKey, new Map());
    });
  }
  const map = produce<Map<T, V>, Map<T, V>>(graph.incomingAdjacency.get(destinationKey), draft => {
    draft.set(sourceKey, condition);
  });
  return produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
    draft.incomingAdjacency.set(destinationKey, map);
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
  for (let [nodeKey] of graph.nodes) {
    const incomingMap = graph.incomingAdjacency.get(nodeKey);
    if (incomingMap === undefined) {
      indegree0.push(nodeKey);
    } else if (incomingMap.size < 1) {
      indegree0.push(nodeKey);
    }
  }
  return indegree0;
}
