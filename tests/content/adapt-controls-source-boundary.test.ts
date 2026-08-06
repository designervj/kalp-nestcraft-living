import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("NestCraft Adapt controls", () => {
  it("keeps operator controls role-restricted and declared", () => {
    const adminBar = readFileSync("components/AdminBar.tsx", "utf8");
    const blueprint = readFileSync(".kalp/authored/blueprint.json", "utf8");

    expect(adminBar).toContain("const OPERATOR_ROLES = new Set");
    expect(adminBar).toContain("OPERATOR_ROLES.has(operatorRole)");
    expect(adminBar).toContain("if (!isAdmin) return null");
    expect(blueprint).toContain('"operator-admin-bar"');
    expect(blueprint).toContain('"page-comments"');
    expect(blueprint).toContain('"inline-content-editing"');
  });
});
