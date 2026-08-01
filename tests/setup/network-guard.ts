import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import { afterEach, beforeEach, vi, type MockInstance } from "vitest";

let networkAttemptCount = 0;
let networkSpies: MockInstance[] = [];

function rejectNetworkAccess(): never {
  networkAttemptCount += 1;
  throw new Error("External network access is disabled in tests");
}

beforeEach(() => {
  networkAttemptCount = 0;
  vi.stubGlobal("fetch", vi.fn(rejectNetworkAccess));
  networkSpies = [
    vi.spyOn(http, "request").mockImplementation(rejectNetworkAccess),
    vi.spyOn(http, "get").mockImplementation(rejectNetworkAccess),
    vi.spyOn(https, "request").mockImplementation(rejectNetworkAccess),
    vi.spyOn(https, "get").mockImplementation(rejectNetworkAccess),
    vi.spyOn(net, "connect").mockImplementation(rejectNetworkAccess),
    vi.spyOn(net, "createConnection").mockImplementation(rejectNetworkAccess),
    vi.spyOn(tls, "connect").mockImplementation(rejectNetworkAccess),
  ];
});

afterEach(() => {
  for (const spy of networkSpies.reverse()) {
    spy.mockRestore();
  }
  networkSpies = [];
  vi.unstubAllGlobals();
});

export function getNetworkAttemptCount(): number {
  return networkAttemptCount;
}
