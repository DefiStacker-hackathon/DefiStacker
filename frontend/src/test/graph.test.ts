import {describe, expect, it} from "@jest/globals";

import { Adapter } from "../lib/adapters/adapter";
import {
  addNode,
  createGraph,
  createNode,
  getIndegree0,
  getTopologicalSortOrder,
  addAdjacency,
  removeAdjacency,
  removeNode
} from "../lib/graph";

describe("createGraph", function() {
  it("should return a new empty graph", function() {
    expect(createGraph<string, Adapter>()).toEqual({
      nodes: new Map(),
      incomingAdjacency: new Map(),
    });
  });
});

describe("createNode", function() {
  it("should return a new node", function() {
    expect(createNode<number>(10)).toEqual({
      value: 10
    });
  });
});

describe("addNode", function() {
  it("should return a copy of the given graph with an additional node", function() {
    const graph_1 = createGraph<number, string>();
    const key = Date.now();
    const node = createNode<string>("A");
    const graph_2 = addNode(graph_1, key, node);
    expect(graph_2.nodes.size).toBeGreaterThan(graph_1.nodes.size);
    expect(graph_2.nodes.get(key)).toEqual(node);
  })
});

describe("removeNode", function() {
  it("should return a copy of the given graph with the given node removed", function() {
    const graph_1 = createGraph<number, string>();
    const key = Date.now();
    const node = createNode<string>("A");
    const graph_2 = addNode(graph_1, key, node);
    const graph_3 = removeNode(graph_2, key);
    expect(graph_2.nodes.get(key)).toEqual(node);
    expect(graph_3.nodes.get(key)).toBeUndefined();
  });
  it("should remove all adjacency relationships that include the given node", function() {
    const graph_1 = createGraph<number, string>();
    const key_1 = Date.now();
    const node_1 = createNode<string>("A");
    const graph_2 = addNode(graph_1, key_1, node_1);
    const key_2 = Date.now() + 1;
    const node_2 = createNode<string>("B");
    const graph_3 = addNode(graph_2, key_2, node_2);
    const key_3 = Date.now() + 2;
    const node_3 = createNode<string>("C");
    const graph_4 = addNode(graph_3, key_3, node_3);
    const graph_5 = addAdjacency(graph_4, key_1, key_2);
    const graph_6 = addAdjacency(graph_5, key_2, key_3);
    const graph_7 = removeNode(graph_6, key_1);
    expect(graph_7.incomingAdjacency.get(key_2)).toEqual([]);
    expect(graph_7.incomingAdjacency.get(key_3)).toEqual([key_2]);
  });
});

describe("addAdjacency", function() {
  const graph_1 = createGraph<number, string>();
  const key_1 = Date.now();
  const node_1 = createNode<string>("A");
  const graph_2 = addNode(graph_1, key_1, node_1);
  const key_2 = Date.now() + 1;
  const node_2 = createNode<string>("B");
  const graph_3 = addNode(graph_2, key_2, node_2);
  const graph_4 = addAdjacency(graph_3, key_1, key_2);
  const graph_5 = addAdjacency(graph_4, key_2, key_1);
  it("should return a copy of the given graph with the adjacency list describing the new edge", function() {
    expect(graph_4.incomingAdjacency.get(key_2)).toContain(key_1);
    expect(graph_5.incomingAdjacency.get(key_1)).toContain(key_2);
  });
});

describe("removeAdjacency", function() {
  const graph_1 = createGraph<number, string>();
  const key_1 = Date.now();
  const node_1 = createNode<string>("A");
  const graph_2 = addNode(graph_1, key_1, node_1);
  const key_2 = Date.now() + 1;
  const node_2 = createNode<string>("B");
  const graph_3 = addNode(graph_2, key_2, node_2);
  const graph_4 = addAdjacency(graph_3, key_1, key_2);
  const graph_5 = addAdjacency(graph_4, key_2, key_1);
  const graph_6 = removeAdjacency(graph_5, key_1, key_2);
  it("should return a copy of the given graph without the described adjacency edge", function() {
    expect(graph_6.incomingAdjacency.get(key_1)).toContain(key_2);
    expect(graph_6.incomingAdjacency.get(key_2)).toEqual([]);
  });
  it("should not remove any nodes", function() {
    expect(graph_5.nodes).toEqual(graph_6.nodes);
  });
});

describe("getIndegree0", function() {
  it("should return all node keys in the graph with indegree 0", function() {
    let graph = createGraph<number, string>();
    const key_1 = Date.now();
    const node_1 = createNode<string>("A");
    graph = addNode(graph, key_1, node_1);
    let indegree0 = getIndegree0(graph);
    expect(indegree0.length).toBe(1);
    expect(indegree0).toEqual([key_1]);

    const key_2 = Date.now() + 1;
    const node_2 = createNode<string>("B");
    graph = addNode(graph, key_2, node_2);
    indegree0 = getIndegree0(graph);
    expect(indegree0.length).toBe(2);
    expect(indegree0).toContain(key_1);
    expect(indegree0).toContain(key_2);

    graph = addAdjacency(graph, key_1, key_2);
    indegree0 = getIndegree0(graph);
    expect(indegree0.length).toBe(1);
    expect(indegree0).toEqual([key_1]);
  })
});

describe("getTopologicalSortOrder", function() {
  it("should return a list of node keys in topological sort order", function() {
    const graph_1 = createGraph<number, string>();

    const key_1 = Date.now();
    const node_1 = createNode<string>("A");
    const graph_2 = addNode(graph_1, key_1, node_1);

    const node_2 = createNode<string>("A");
    const key_2 = Date.now() + 1;
    const graph_3 = addNode(graph_2, key_2, node_2);

    const graph_4 = addAdjacency(graph_3, key_1, key_2);
    const sortOrder = getTopologicalSortOrder(graph_4);
    expect(sortOrder).toEqual([key_1, key_2]);
  });
  it("should return an empty list for an empty graph", function() {
    const graph = createGraph<number, string>();
    const sortOrder = getTopologicalSortOrder(graph);
    expect(sortOrder).toEqual([]);
  });
});
