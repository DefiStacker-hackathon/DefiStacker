import {describe, expect, it} from "@jest/globals";

import { Adapter } from "../lib/adapters/adapter";
import { addNode, createGraph, createNode } from "../lib/graph";

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
