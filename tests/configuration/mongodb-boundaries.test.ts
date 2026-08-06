import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const mongoCalls = vi.hoisted(() => ({
  constructor: vi.fn(),
  instanceConnect: vi.fn(),
  staticConnect: vi.fn(),
}));

vi.mock("mongodb", () => {
  class MockMongoClient {
    static connect = mongoCalls.staticConnect;

    constructor(...args: unknown[]) {
      mongoCalls.constructor(...args);
    }

    connect(...args: unknown[]) {
      return mongoCalls.instanceConnect(...args);
    }
  }

  return {
    MongoClient: MockMongoClient,
    ObjectId: class MockObjectId {},
    ServerApiVersion: { v1: "1" },
  };
});

describe("MongoDB configuration boundaries", () => {
  beforeEach(() => {
    delete process.env.MONGODB_URI;
    vi.resetModules();
    mongoCalls.constructor.mockReset();
    mongoCalls.instanceConnect.mockReset();
    mongoCalls.staticConnect.mockReset();
  });

  it("imports both Mongo helpers without constructing or connecting a client", async () => {
    await import("@/lib/mongodb");
    await import("@/lib/db");

    expect(mongoCalls.constructor).not.toHaveBeenCalled();
    expect(mongoCalls.instanceConnect).not.toHaveBeenCalled();
    expect(mongoCalls.staticConnect).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("rejects missing configuration before either connection boundary runs", async () => {
    const { getMongoClient } = await import("@/lib/mongodb");
    const { connectClient } = await import("@/lib/db");

    expect(() => getMongoClient()).toThrow(/MONGODB_URI/);
    await expect(connectClient()).rejects.toThrow(/MONGODB_URI/);

    expect(mongoCalls.constructor).not.toHaveBeenCalled();
    expect(mongoCalls.instanceConnect).not.toHaveBeenCalled();
    expect(mongoCalls.staticConnect).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("rejects missing tenant database authority before creating a Mongo connection", async () => {
    delete process.env.DB_NAME;

    const { connectMasterDB, connectTenantDB } = await import("@/lib/db");

    await expect(connectTenantDB()).rejects.toMatchObject({
      code: "DATABASE_CONFIGURATION_UNAVAILABLE",
    });
    await expect(connectMasterDB()).rejects.toMatchObject({
      code: "DATABASE_CONFIGURATION_UNAVAILABLE",
    });
    expect(mongoCalls.constructor).not.toHaveBeenCalled();
    expect(mongoCalls.instanceConnect).not.toHaveBeenCalled();
    expect(mongoCalls.staticConnect).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("keeps the comments GET response contract without attempting MongoDB", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const { GET } = await import("@/app/api/comments/route");
      const response = await GET(
        new NextRequest("http://localhost/api/comments"),
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        success: false,
        error: "Server configuration is unavailable",
      });
      expect(mongoCalls.constructor).not.toHaveBeenCalled();
      expect(mongoCalls.instanceConnect).not.toHaveBeenCalled();
      expect(mongoCalls.staticConnect).not.toHaveBeenCalled();
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleError.mockRestore();
    }
  });
});
