import {describe, expect, it} from "@jest/globals";

import { Adapter } from "../lib/adapters/adapter";
import { addNode, createGraph, createNode, addAdjacency } from "../lib/graph";

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

describe("addAdjacency", function() {
  it("should return a copy of the given graph with the adjacency list describing the new edge", function() {
    const graph_1 = createGraph<number, string>();
    const key_1 = Date.now();
    const node_1 = createNode<string>("A");
    const graph_2 = addNode(graph_1, key_1, node_1);
    const key_2 = Date.now();
    const node_2 = createNode<string>("B");
    const graph_3 = addNode(graph_2, key_2, node_2);
    const graph_4 = addAdjacency(graph_3, key_1, key_2);
    const condition = (value: number) => value === 1;
    const graph_5 = addAdjacency(graph_4, key_2, key_1, condition);
    expect(graph_4.incomingAdjacency.get(key_2).get(key_1)).toEqual(undefined);
    expect(graph_5.incomingAdjacency.get(key_1).get(key_2)).toEqual(condition);
  })
});

