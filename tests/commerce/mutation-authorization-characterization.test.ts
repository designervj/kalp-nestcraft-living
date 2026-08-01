import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

type AuthKind = "admin" | "optional-user" | "none";

const expectedRouteAuthority: Record<string, Record<string, AuthKind>> = {
  "attributes/bulk/route.ts": { POST: "admin" },
  "attributes/route.ts": {
    GET: "none",
    POST: "admin",
    PUT: "admin",
    DELETE: "admin",
  },
  "cart/route.ts": {
    GET: "optional-user",
    POST: "optional-user",
    PUT: "optional-user",
    DELETE: "optional-user",
  },
  "categories/bulk/route.ts": { POST: "admin" },
  "categories/route.ts": {
    GET: "none",
    POST: "admin",
    PUT: "admin",
    DELETE: "admin",
  },
  "orders/[id]/route.ts": { PUT: "admin" },
  "orders/route.ts": { GET: "admin" },
  "products/[id]/route.ts": {
    GET: "none",
    PUT: "admin",
    DELETE: "admin",
  },
  "products/bulk/route.ts": { POST: "admin" },
  "products/route.ts": {
    GET: "none",
    POST: "admin",
    PUT: "admin",
    DELETE: "admin",
  },
  "upload/route.ts": { POST: "admin" },
  "variants/route.ts": { GET: "admin" },
};

function walkRoutes(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkRoutes(entryPath);
    return entry.name === "route.ts" ? [entryPath] : [];
  });
}

function exportedMethods(sourcePath: string): Record<string, AuthKind> {
  const source = fs.readFileSync(sourcePath, "utf8");
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const methods: Record<string, AuthKind> = {};

  for (const statement of sourceFile.statements) {
    if (!ts.isFunctionDeclaration(statement) || !statement.name) continue;
    if (
      !statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    ) {
      continue;
    }
    const method = statement.name.text;
    if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) continue;

    const body = statement.body?.getText(sourceFile) || "";
    if (
      body.includes("authenticateAdmin(") ||
      body.includes("authorizeCommerceAdmin(")
    ) {
      methods[method] = "admin";
    } else if (sourcePath.endsWith(`${path.sep}cart${path.sep}route.ts`)) {
      methods[method] = "optional-user";
    } else {
      methods[method] = "none";
    }
  }

  return methods;
}

describe("commerce mutation authorization characterization", () => {
  it("reconciles every local ecommerce route and exported method", () => {
    const root = path.join(process.cwd(), "app", "api", "ecommerce");
    const actual = Object.fromEntries(
      walkRoutes(root)
        .sort()
        .map((sourcePath) => [
          path.relative(root, sourcePath).split(path.sep).join("/"),
          exportedMethods(sourcePath),
        ]),
    );

    expect(actual).toEqual(expectedRouteAuthority);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("proves that no local catalog mutation remains unauthenticated", () => {
    const unauthenticatedMutations = Object.entries(expectedRouteAuthority)
      .flatMap(([route, methods]) =>
        Object.entries(methods).map(([method, authority]) => ({
          route,
          method,
          authority,
        })),
      )
      .filter(
        ({ method, authority }) =>
          method !== "GET" && authority === "none",
      )
      .map(({ route, method }) => `${method} ${route}`)
      .sort();

    expect(unauthenticatedMutations).toEqual([]);
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
