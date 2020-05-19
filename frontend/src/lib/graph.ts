import produce, { enableMapSet } from "immer";

enableMapSet();

export interface Graph<Node, NodeKey> {
  nodes: Map<NodeKey, Node>; // Helpful to use timestamp as key instead of hash function
  /**
   * The first node key represents a node in the above node map.
   * The second node key represents a node that has an edge pointing
   * to the first node key.
   * Condition is any expression that must be true in order for this
   * edge to be "valid" in the graph.
   */
  incomingAdjacency: Map<NodeKey, Array<NodeKey>>;
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
  return produce(node, draft => {});
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
    draft.incomingAdjacency.set(key, []);
  });
}

/**
 * 
 * @param graph
 * @param node
 */
export function addCreatedNode<T, V>(
  graph: Graph<Node<V>, T>,
  key: T,
  value: V
): Graph<Node<V>, T> {
  const node = createNode(value);
  return produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
    draft.nodes.set(key, node);
    draft.incomingAdjacency.set(key, []);
  });
}

/**
 * Returns a clone of `graph` with all traces of `node` removed.
 * @param graph
 * @param key
 */
export function removeNode<T, V>(
  graph: Graph<Node<V>, T>,
  nodeKey: T
): Graph<Node<V>, T> {
  let nextGraph = produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
    draft.nodes.delete(nodeKey);
  });
  graph.incomingAdjacency.forEach((currentList, currentNodeKey) => {
    const idx = currentList.indexOf(nodeKey);
    if (idx > -1) {
      nextGraph = produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
        draft.incomingAdjacency.get(currentNodeKey).splice(idx);
      });
    };
  });
  return nextGraph;
}

export function addAdjacency<T, V>(
  graph: Graph<Node<V>, T>,
  sourceKey: T,
  destinationKey: T
): Graph<Node<V>, T> {
  const list = produce<Array<T>, Array<T>>(graph.incomingAdjacency.get(destinationKey), draft => {
    draft.push(sourceKey);
  });
  return produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
    draft.incomingAdjacency.set(destinationKey, list);
  });
}

/**
 * Removes `sourceKey` from `graph.incomingAdjacency` list of `destinationKey`.
 * @param graph 
 * @param sourceKey 
 * @param destinationKey 
 */
export function removeAdjacency<T, V>(
  graph: Graph<Node<V>, T>,
  sourceKey: T,
  destinationKey: T
): Graph<Node<V>, T> {
  const idx = graph.incomingAdjacency.get(destinationKey).indexOf(sourceKey);
  if (idx > -1) {
    const list = produce<Array<T>, Array<T>>(graph.incomingAdjacency.get(destinationKey), draft => {
      draft.splice(idx);
    });
    return produce<Graph<Node<V>, T>, Graph<Node<V>, T>>(graph, draft => {
      draft.incomingAdjacency.set(destinationKey, list);
    });
  } else {
    throw Error("The adjacency does not exist");
  }
}

/**
 * Returns a list of the `graph` node keys in topological sort order.
 * Uses Kahn's algorithm.
 * @param graph 
 */
export function getTopologicalSortOrder<T, V>(graph: Graph<Node<V>, T>): Array<T> {
  graph = cloneGraph(graph);

  const sorted = [];
  const indegree0: Array<T> = getIndegree0(graph);

  while (indegree0.length > 0) {
    const indegree0NodeKey = indegree0.pop();
    sorted.push(indegree0NodeKey);
    for (let [nodeKey] of graph.incomingAdjacency) {
      try {
        graph = removeAdjacency(graph, indegree0NodeKey, nodeKey);
        if (graph.incomingAdjacency.get(nodeKey).length < 1) {
          indegree0.push(nodeKey);
        }
      } catch (error) {
        // pass
      }
    }
  }

  for (let [, list] of graph.incomingAdjacency) {
    if (list.length > 0) {
      throw Error("Found a cycle!");
    }
  }
  return sorted;
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
    const incoming: Array<T> = graph.incomingAdjacency.get(nodeKey);
    if (incoming === undefined) {
      indegree0.push(nodeKey);
    } else if (incoming.length < 1) {
      indegree0.push(nodeKey);
    }
  }
  return indegree0;
}
