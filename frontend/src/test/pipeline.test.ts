import {describe, expect, it} from "@jest/globals";

import { createAdapter, AdapterKind } from "../lib/adapters/adapter";
import { takeFlashLoan, payBackFlashLoan } from "../lib/adapters/aave";
import {
  startNewPipeline,
  addAdapter,
  serializePipeline,
  deserializePipeline
} from "../lib/pipeline";

describe("startNewPipeline", function() {
  it("should return a new empty graph", function() {
    expect(startNewPipeline()).toEqual({
      nodes: new Map(),
      incomingAdjacency: new Map(),
    });
  });
});

describe("addAdapter", function() {
  it("should return a new pipeline", function() {
    const pipeline_1 = startNewPipeline();
    const adapter = createAdapter(
      AdapterKind.AAVE,
      takeFlashLoan,
      ["DAI", "200"]
    );
    const { pipeline: pipeline_2 } = addAdapter(pipeline_1, adapter);
    expect(pipeline_2 === pipeline_1).toBeFalsy();
    expect(pipeline_2.nodes.size).toBeGreaterThan(pipeline_1.nodes.size);
  });
  it("should return a pipeline with the adapter as a node", function() {
    let pipeline_1 = startNewPipeline();
    const adapter = createAdapter(
      AdapterKind.AAVE,
      takeFlashLoan,
      ["DAI", "200"]
    );
    let { pipeline: pipeline_2, adapterId} = addAdapter(pipeline_1, adapter);
    expect(pipeline_2.nodes.get(adapterId)).toEqual({ value: adapter});
  });
  it("should return a pipeline the adapter connected to others as described", function() {
    let pipeline_1 = startNewPipeline();
    const adapter_1 = createAdapter(
      AdapterKind.AAVE,
      takeFlashLoan,
      ["DAI", "200"]
    );
    const adapter_2 = createAdapter(
      AdapterKind.AAVE,
      payBackFlashLoan,
      ["DAI", "200"]
    );
    let { pipeline: pipeline_2, adapterId: adapter_1_id } = addAdapter(pipeline_1, adapter_1);
    let { pipeline: pipeline_3, adapterId: adapter_2_id } = addAdapter(pipeline_2, adapter_2, [adapter_1_id]);
    expect(pipeline_3.incomingAdjacency.get(adapter_2_id)).toContain(adapter_1_id);
  });
});

describe("serializePipeline", function() {
  it("should return a string representing the given pipeline", function() {
    let pipeline_1 = startNewPipeline();
    const adapter_1 = createAdapter(
      AdapterKind.AAVE,
      takeFlashLoan,
      ["DAI", "200"]
    );
    const adapter_2 = createAdapter(
      AdapterKind.AAVE,
      payBackFlashLoan,
      ["DAI", "200"]
    );
    let { pipeline: pipeline_2, adapterId: adapter_1_id } = addAdapter(pipeline_1, adapter_1);
    let { pipeline: pipeline_3, adapterId: adapter_2_id } = addAdapter(pipeline_2, adapter_2, [adapter_1_id]);
    // Map objects will be represented as arrays of pairs 
    expect(serializePipeline(pipeline_3)).toContain(`adapters":[[${adapter_1_id},{"value`);
    expect(serializePipeline(pipeline_3)).toContain(`${adapter_2_id},[${adapter_1_id}]`);
  });
});

describe("deserializePipeline", function() {
  it("should convert a stringified pipeline into a Graph object", function() {
    let pipeline_1 = startNewPipeline();
    const adapter_1 = createAdapter(
      AdapterKind.AAVE,
      takeFlashLoan,
      ["DAI", "200"]
    );
    const adapter_2 = createAdapter(
      AdapterKind.AAVE,
      payBackFlashLoan,
      ["DAI", "200"]
    );
    let { pipeline: pipeline_2, adapterId: adapter_1_id } = addAdapter(pipeline_1, adapter_1);
    let { pipeline: pipeline_3  } = addAdapter(pipeline_2, adapter_2, [adapter_1_id]);
    const serialized = serializePipeline(pipeline_3);
    expect(deserializePipeline(serialized)).toEqual(pipeline_3);
    expect(deserializePipeline(serialized).nodes.get(adapter_1_id)).toEqual({value: adapter_1});
  });
})

