import {describe, expect, it} from "@jest/globals";
import { Adapter, AdapterKind } from "../lib/adapters/adapter";

describe("The Adapter interface", function() {
  it("creates an adapter", function() {
    const adapter: Adapter = {
      kind: AdapterKind.KYBER,
      method: null,
      args: [],
      outcome: true
    };
    expect(adapter.kind).toBe(AdapterKind.KYBER);
    expect(adapter.outcome).toBe(true);
  })
});