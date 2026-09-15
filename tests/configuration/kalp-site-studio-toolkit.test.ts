import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createFieldDraftAdapter, defineSiteStudioManifest, KalpEditorError } from "@/packages/kalp-site-studio-toolkit/src";

describe("Kalp Developer Toolkit — Site Studio", () => {
  it("posts the Business Core field-draft contract with the authenticated session", async () => {
    const request = vi.fn(async () => new Response(JSON.stringify({
      success: true,
      data: { draftId: "draft-1", revision: 2, status: "draft", publicationAllowed: false },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    const adapter = createFieldDraftAdapter({ fetch: request as typeof fetch });
    const input = { pageSlug: "home", sectionId: "hero", fieldPath: "content.heading", value: "Made well" };

    await expect(adapter.save(input)).resolves.toMatchObject({ success: true });
    expect(request).toHaveBeenCalledWith(
      "/api/publishing/page-drafts/field-changes",
      expect.objectContaining({ method: "POST", credentials: "include", body: JSON.stringify(input) }),
    );
  });

  it("surfaces authorization and validation failures", async () => {
    const request = vi.fn(async () => new Response(JSON.stringify({ detail: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }));
    const adapter = createFieldDraftAdapter({ fetch: request as typeof fetch });

    await expect(adapter.save({ pageSlug: "home", sectionId: "hero", fieldPath: "content.heading", value: "x" }))
      .rejects.toEqual(new KalpEditorError("Forbidden", 403));
  });

  it("keeps site mappings neutral and optional capabilities explicit", () => {
    const manifest = defineSiteStudioManifest({
      schemaVersion: "kalp.site-studio.v1",
      siteId: "example-store",
      capabilities: {
        content: { enabled: true, mode: "draft" },
        catalog: { enabled: false },
        pricing: { enabled: false },
        media: { enabled: false },
      },
      fields: {
        heroHeading: { sectionId: "hero", fieldPath: "content.heading", valueType: "text" },
      },
    });
    expect(manifest.siteId).toBe("example-store");
    expect(manifest.capabilities.pricing?.enabled).toBe(false);
  });

  it("rejects implicit content capability and unsafe site identifiers", () => {
    expect(() => defineSiteStudioManifest({
      schemaVersion: "kalp.site-studio.v1",
      siteId: "Unsafe Site",
      capabilities: {},
    })).toThrow(KalpEditorError);
  });

  it("ships an explicit tenant-safe Pattern manifest", () => {
    const pack = JSON.parse(readFileSync(
      "packages/kalp-site-studio-toolkit/patterns/content-field-draft/0.1.0/manifest.json",
      "utf8",
    ));
    expect(pack.schemaVersion).toBe("kalp.site-studio.pattern.v1");
    expect(pack.safety).toEqual({
      syntheticFixtures: true,
      containsSecrets: false,
      containsPersonalData: false,
    });
  });

  it("ships a generic foreground Site Launcher with safe profiles and package-manager detection", () => {
    const launcher = readFileSync(
      "packages/kalp-site-studio-toolkit/setup/SiteLauncher.ps1",
      "utf8",
    );
    expect(launcher).toContain('ValidateSet("Configure", "Start", "Build")');
    expect(launcher).toContain('ValidateSet("Local", "Live")');
    expect(launcher).toContain("pnpm-lock.yaml");
    expect(launcher).toContain("yarn.lock");
    expect(launcher).toContain("package-lock.json");
    expect(launcher).toContain("bun.lock");
    expect(launcher).toContain("Stop: press Ctrl+C");
    expect(launcher).toContain("'/health/live', '/health'");
    expect(launcher).toContain("not the Kalp OS Launcher");
    expect(launcher).not.toMatch(/Start-Process|-[Ww]indowStyle|mongodb(?:\+srv)?:\/\//);
  });
});
