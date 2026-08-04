import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = (path: string) => readFileSync(join(root, path), "utf8");

describe("governed frontend adaptation contract", () => {
  it("keeps the primary locale out of public URLs", () => {
    const middleware = source("middleware.ts");
    expect(middleware).toMatch(/const defaultLocale = "en"/);
    expect(middleware).toMatch(/NextResponse\.redirect/);
    expect(middleware).toMatch(/NextResponse\.rewrite/);
  });

  it("shows operational controls only to an explicit role allowlist", () => {
    const adminBar = source("components/AdminBar.tsx");
    expect(adminBar).toContain('"admin"');
    expect(adminBar).toContain('"staff"');
    expect(adminBar).toContain("OPERATOR_ROLES.has");
    expect(adminBar).not.toContain('user?.role !== "customer"');
  });

  it("supports governed account sign-in without removing guest Checkout", () => {
    const checkout = source("components/pages/CheckoutPage.tsx");
    expect(checkout).toContain("loginThunk");
    expect(checkout).toContain("Sign in here without leaving Checkout or losing this Cart");
    expect(checkout).toContain("Guest Checkout remains available");
    expect(checkout).toContain('autoComplete="current-password"');
  });

  it("binds comments and inline edits to Business Core review contracts", () => {
    const manifest = JSON.parse(
      source(".kalp/authored/frontend-capabilities.json"),
    );
    expect(manifest.features.page_comments.status).toBe("OBSERVED_CANDIDATE");
    expect(manifest.features.inline_content_editing.status).toBe("OBSERVED_CANDIDATE");
    const commentRoute = source("app/api/comments/route.ts");
    expect(commentRoute).toContain("publishing/page-reviews/comments");
    expect(commentRoute).not.toContain("getMongoClient");
    const editor = source("lib/editorUtils.ts");
    expect(editor).toContain("/api/publishing/page-drafts/field-changes");
    expect(editor).not.toContain("updatePageThunk");
  });
});
