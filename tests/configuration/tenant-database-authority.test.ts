import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const databaseMocks = vi.hoisted(() => ({
  getMongoClient: vi.fn(),
  database: vi.fn(),
  collection: vi.fn(),
  find: vi.fn(),
  toArray: vi.fn(),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoClient: databaseMocks.getMongoClient,
}));

const APPROVED_DATABASE = "approved_test_database";
const UNTRUSTED_DATABASE = "untrusted_test_database";

function configureMockDatabase() {
  databaseMocks.toArray.mockResolvedValue([]);
  databaseMocks.find.mockReturnValue({ toArray: databaseMocks.toArray });
  databaseMocks.collection.mockReturnValue({ find: databaseMocks.find });
  databaseMocks.database.mockReturnValue({
    collection: databaseMocks.collection,
  });
  databaseMocks.getMongoClient.mockResolvedValue({
    db: databaseMocks.database,
  });
}

describe("server-configured tenant database authority", () => {
  beforeEach(() => {
    delete process.env.DB_NAME;
    delete process.env.MONGODB_URI;
    delete process.env.NEXT_PUBLIC_TENANT_ID;
    delete process.env.NEXT_PUBLIC_TENANT_DB_NAME;
    vi.resetModules();
    vi.clearAllMocks();
    configureMockDatabase();
  });

  it.each([undefined, "", "   ", "invalid.database", "../invalid"])(
    "fails closed for an unavailable or invalid server database name",
    async (databaseName) => {
      if (databaseName === undefined) {
        delete process.env.DB_NAME;
      } else {
        process.env.DB_NAME = databaseName;
      }

      const { getConfiguredDatabaseName } = await import(
        "@/lib/database-authority"
      );

      expect(() => getConfiguredDatabaseName()).toThrow(
        "Server database configuration is unavailable",
      );
      expect(databaseMocks.getMongoClient).not.toHaveBeenCalled();
      expect(getNetworkAttemptCount()).toBe(0);
    },
  );

  it("uses only DB_NAME and ignores public tenant values", async () => {
    process.env.DB_NAME = `  ${APPROVED_DATABASE}  `;
    process.env.NEXT_PUBLIC_TENANT_ID = UNTRUSTED_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_DB_NAME = UNTRUSTED_DATABASE;

    const { getConfiguredDatabaseName } = await import(
      "@/lib/database-authority"
    );

    expect(getConfiguredDatabaseName()).toBe(APPROVED_DATABASE);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("selects the configured database through the shared local boundary", async () => {
    process.env.DB_NAME = APPROVED_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_ID = UNTRUSTED_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_DB_NAME = UNTRUSTED_DATABASE;
    const database = vi.fn().mockReturnValue({ approved: true });
    const getClient = vi.fn().mockResolvedValue({ db: database });

    const { connectTenantDB } = await import("@/lib/db");
    const result = await connectTenantDB(getClient);

    expect(result).toEqual({ approved: true });
    expect(getClient).toHaveBeenCalledTimes(1);
    expect(database).toHaveBeenCalledWith(APPROVED_DATABASE);
    expect(database).not.toHaveBeenCalledWith(UNTRUSTED_DATABASE);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("ignores x-tenant-db and preserves the comments success contract", async () => {
    process.env.DB_NAME = APPROVED_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_ID = UNTRUSTED_DATABASE;

    const { GET } = await import("@/app/api/comments/route");
    const response = await GET(
      new NextRequest("http://localhost/api/comments", {
        headers: { "x-tenant-db": UNTRUSTED_DATABASE },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, pages: [] });
    expect(databaseMocks.database).toHaveBeenCalledTimes(1);
    expect(databaseMocks.database).toHaveBeenCalledWith(APPROVED_DATABASE);
    expect(databaseMocks.database).not.toHaveBeenCalledWith(
      UNTRUSTED_DATABASE,
    );
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("rejects missing comments configuration before Mongo client access", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const { GET } = await import("@/app/api/comments/route");
      const response = await GET(
        new NextRequest("http://localhost/api/comments", {
          headers: { "x-tenant-db": UNTRUSTED_DATABASE },
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        success: false,
        error: "Failed to fetch pages",
      });
      expect(JSON.stringify(body)).not.toContain(UNTRUSTED_DATABASE);
      expect(JSON.stringify(body)).not.toContain("DB_NAME");
      expect(databaseMocks.getMongoClient).not.toHaveBeenCalled();
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleError.mockRestore();
    }
  });

  it("overwrites a caller database header on a mocked proxy request", async () => {
    process.env.DB_NAME = APPROVED_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_ID = UNTRUSTED_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_DB_NAME = UNTRUSTED_DATABASE;
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ success: true }, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { proxyRequest } = await import("@/lib/apiProxy");
    const response = await proxyRequest(
      new NextRequest("http://localhost/api/example", {
        headers: { "x-tenant-db": UNTRUSTED_DATABASE },
      }),
      "example",
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = requestOptions.headers as Headers;
    expect(headers.get("x-tenant-db")).toBe(APPROVED_DATABASE);
    expect(headers.get("x-tenant-db")).not.toBe(UNTRUSTED_DATABASE);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("rejects proxy configuration before any fetch attempt", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { proxyRequest } = await import("@/lib/apiProxy");
    const response = await proxyRequest(
      new NextRequest("http://localhost/api/example", {
        headers: { "x-tenant-db": UNTRUSTED_DATABASE },
      }),
      "example",
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: "Server configuration is unavailable",
    });
    expect(JSON.stringify(body)).not.toContain(UNTRUSTED_DATABASE);
    expect(JSON.stringify(body)).not.toContain("DB_NAME");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(databaseMocks.getMongoClient).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
