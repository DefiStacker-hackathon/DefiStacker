import {describe, expect, it} from "@jest/globals";

import { Edge, Node, serializeNode, serializeEdge } from "../lib/graph";

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
