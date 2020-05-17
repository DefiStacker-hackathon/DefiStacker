import {describe, expect, it} from "@jest/globals";

import { createAdapter, AdapterKind } from "../lib/adapters/adapter";
import { takeFlashLoan, payBackFlashLoan } from "../lib/adapters/aave";
import { startNewPipeline, addAdapterToPipeline } from "../lib/pipeline";

describe("startNewPipeline", function() {
  it("should return a new empty graph", function() {
    expect(startNewPipeline()).toEqual({
      nodes: new Map(),
      incomingAdjacency: new Map(),
    });
  });
});

describe("addAdapterToPipeline", function() {
  it("should return a new pipeline", function() {
    const pipeline_1 = startNewPipeline();
    const adapter = createAdapter(
      AdapterKind.AAVE,
      takeFlashLoan,
      ["DAI", "200"]
    );
    const { pipeline: pipeline_2 } = addAdapterToPipeline(pipeline_1, adapter);
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
    let { pipeline: pipeline_2, adapterId} = addAdapterToPipeline(pipeline_1, adapter);
    expect(pipeline_2.nodes.get(adapterId)).toEqual({ value: adapter});
  });
  it("should return a pipeline the adapter connected to others as described and required outcomes as true", function() {
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
    let { pipeline: pipeline_2, adapterId: adapter_1_id } = addAdapterToPipeline(pipeline_1, adapter_1);
    let { pipeline: pipeline_3, adapterId: adapter_2_id } = addAdapterToPipeline(pipeline_2, adapter_2, [adapter_1_id]);
    expect(pipeline_3.incomingAdjacency.get(adapter_2_id).get(adapter_1_id)).toBe(true);
  });
});