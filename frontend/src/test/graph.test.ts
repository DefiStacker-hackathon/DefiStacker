import {describe, expect, it} from "@jest/globals";

import { Adapter } from "../lib/adapters/adapter";
import { Edge, Node, addNode, createGraph, createNode, serializeNode, serializeEdge } from "../lib/graph";

describe("createGraph", function() {
  it("should return a new empty graph", function() {
    expect(createGraph<Adapter>()).toStrictEqual({nodes: [], edges:[]});
  });
});

describe("addNode", function() {
  it("should return a copy of the given graph with an additional node", function() {
    const graph_1 = createGraph<string>();
    const node = createNode<string>("A");
    const graph_2 = addNode(graph_1, node);
    expect(graph_2.edges).toStrictEqual(graph_1.edges);
    expect(graph_2.nodes.length).toBeGreaterThan(graph_1.nodes.length);
    expect(graph_2.nodes).toStrictEqual([node]);
  })
});

describe("serializeNode", function() {
  it("should return a JSON stringified node", function() {
    let stringNode: Node<string> = { value: "serialized" };
    let numberNode: Node<number> = { value: 10 };
    let booleanNode: Node<boolean> = { value: true };
    let complexNode: Node<Node<string>> = { value: stringNode };
    expect(serializeNode(stringNode)).toBe("{\"value\":\"serialized\"}");
    expect(serializeNode(numberNode)).toBe("{\"value\":10}");
    expect(serializeNode(booleanNode)).toBe("{\"value\":true}");
    expect(serializeNode(complexNode)).toBe("{\"value\":{\"value\":\"serialized\"}}");
  });
});

describe("serializeEdge", function() {
  it("should describe node relationships", function() {
    let nodeA: Node<string> = { value: "A" };
    let nodeB: Node<string> = { value: "B" };
    let edge: Edge<string> = { 
      source: nodeA,
      destination: nodeB,
      requiredOutcome: true,
    };
    expect(serializeEdge(edge)).toBe("{\"source\":{\"value\":\"A\"},\"destination\":{\"value\":\"B\"},\"requiredOutcome\":true}");
  });
});
