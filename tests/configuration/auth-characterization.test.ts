import { randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const authMocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  getCartModel: vi.fn(),
  jwtVerify: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: authMocks.cookies,
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: authMocks.jwtVerify,
  },
}));

vi.mock("@/models", () => ({
  getCartModel: authMocks.getCartModel,
}));

vi.mock("@/lib/db", () => ({
  connectTenantDB: vi.fn(() => {
    throw new Error("Database access is disabled in tests");
  }),
}));

function configureSessionCookies() {
  const cookieValues = new Map([
    ["kalp_session", { value: "opaque-test-token" }],
    ["cart_session_id", { value: "opaque-cart-session" }],
  ]);
  authMocks.cookies.mockResolvedValue({
    get: vi.fn((name: string) => cookieValues.get(name)),
    set: vi.fn(),
  });
}

async function invokeCartGet() {
  const findOne = vi.fn().mockResolvedValue({ items: [] });
  authMocks.getCartModel.mockResolvedValue({ findOne });
  const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

  try {
    const { GET } = await import("@/app/api/ecommerce/cart/route");
    const response = await GET();
    return { response, findOne };
  } finally {
    consoleLog.mockRestore();
  }
}

describe("fail-closed authentication configuration", () => {
  beforeEach(() => {
    delete process.env.JWT_SECRET;
    vi.resetModules();
    authMocks.cookies.mockReset();
    authMocks.getCartModel.mockReset();
    authMocks.jwtVerify.mockReset();
  });

  it("does not verify or authenticate when JWT_SECRET is missing", async () => {
    authMocks.cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "opaque-test-token" })),
    });

    const { authenticateAdmin } = await import("@/lib/auth");
    const result = await authenticateAdmin();

    expect(result).toBeNull();
    expect(authMocks.jwtVerify).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("treats a blank JWT_SECRET as missing", async () => {
    process.env.JWT_SECRET = "   ";
    authMocks.cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "opaque-test-token" })),
    });

    const { authenticateAdmin } = await import("@/lib/auth");
    const result = await authenticateAdmin();

    expect(result).toBeNull();
    expect(authMocks.jwtVerify).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it.each(["invalid", "expired"])(
    "fails closed for an %s token",
    async (failureKind) => {
      process.env.JWT_SECRET = randomBytes(32).toString("hex");
      authMocks.cookies.mockResolvedValue({
        get: vi.fn(() => ({ value: "opaque-test-token" })),
      });
      const tokenError = new Error(`${failureKind} token`);
      tokenError.name =
        failureKind === "expired" ? "TokenExpiredError" : "JsonWebTokenError";
      authMocks.jwtVerify.mockImplementation(() => {
        throw tokenError;
      });

      const { authenticateAdmin } = await import("@/lib/auth");
      const result = await authenticateAdmin();

      expect(result).toBeNull();
      expect(authMocks.jwtVerify).toHaveBeenCalledTimes(1);
      expect(getNetworkAttemptCount()).toBe(0);
    },
  );

  it("preserves successful verification with runtime-generated test material", async () => {
    process.env.JWT_SECRET = randomBytes(32).toString("hex");
    authMocks.cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "opaque-test-token" })),
    });
    authMocks.jwtVerify.mockReturnValue({ role: "characterized" });

    const { authenticateAdmin } = await import("@/lib/auth");
    const result = await authenticateAdmin();

    expect(result).toEqual({ role: "characterized" });
    expect(authMocks.jwtVerify).toHaveBeenCalledTimes(1);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it.each([
    ["missing", undefined],
    ["blank", "   "],
  ])("keeps the cart anonymous when JWT_SECRET is %s", async (_label, secret) => {
    if (secret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = secret;
    }
    configureSessionCookies();

    const { response, findOne } = await invokeCartGet();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Cart fetched successfully",
      data: [],
      status: 200,
    });
    expect(authMocks.jwtVerify).not.toHaveBeenCalled();
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("does not authenticate an unverifiable cart session", async () => {
    process.env.JWT_SECRET = randomBytes(32).toString("hex");
    configureSessionCookies();
    authMocks.jwtVerify.mockImplementation(() => {
      throw new Error("Unverifiable test token");
    });

    const { response, findOne } = await invokeCartGet();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Cart fetched successfully",
      data: [],
      status: 200,
    });
    expect(authMocks.jwtVerify).toHaveBeenCalledTimes(1);
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
