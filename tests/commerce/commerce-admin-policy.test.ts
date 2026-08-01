import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const policyMocks = vi.hoisted(() => ({
  authenticateAdmin: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authenticateAdmin: policyMocks.authenticateAdmin,
}));

describe("commerce administration policy", () => {
  beforeEach(() => {
    vi.resetModules();
    policyMocks.authenticateAdmin.mockReset();
  });

  it("returns 401 when no verified session is available", async () => {
    policyMocks.authenticateAdmin.mockResolvedValue(null);

    const { authorizeCommerceAdmin } = await import("@/lib/commerce-admin");
    const result = await authorizeCommerceAdmin();

    expect(result.authorized).toBe(false);
    if (result.authorized) throw new Error("Expected authorization rejection");
    expect(result.response.status).toBe(401);
    expect(await result.response.json()).toEqual({ error: "Unauthorized" });
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it.each([
    ["customer", { role: "customer" }],
    ["missing role", { sub: "symbolic-user" }],
    ["string payload", "symbolic-payload"],
  ])("returns 403 for an authenticated %s principal", async (_label, principal) => {
    policyMocks.authenticateAdmin.mockResolvedValue(principal);

    const { authorizeCommerceAdmin } = await import("@/lib/commerce-admin");
    const result = await authorizeCommerceAdmin();

    expect(result.authorized).toBe(false);
    if (result.authorized) throw new Error("Expected authorization rejection");
    expect(result.response.status).toBe(403);
    expect(await result.response.json()).toEqual({ error: "Forbidden" });
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it.each(["admin", "tenant_admin"])(
    "permits the repository-supported %s role",
    async (role) => {
      policyMocks.authenticateAdmin.mockResolvedValue({ role });

      const { authorizeCommerceAdmin } = await import("@/lib/commerce-admin");
      const result = await authorizeCommerceAdmin();

      expect(result.authorized).toBe(true);
      if (!result.authorized) throw new Error("Expected authorization");
      expect(result.principal).toEqual({ role });
      expect(getNetworkAttemptCount()).toBe(0);
    },
  );
});
