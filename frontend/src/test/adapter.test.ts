import * as ethers from "ethers";
import {describe, expect, it} from "@jest/globals";
import { Adapter, AdapterKind } from "../lib/adapters/adapter";
import { KyberAdapter } from "../contracts/KyberAdapter";

const provider = new ethers.providers.JsonRpcProvider("");

describe("The Adapter interface", function() {
  it("creates an adapter", function() {
    const adapter: Adapter = {
      kind: AdapterKind.KYBER,
      contract: new KyberAdapter("hello", provider),
      method: null,
      args: [],
    };
    expect(adapter.kind).toBe(AdapterKind.KYBER);
  })
});