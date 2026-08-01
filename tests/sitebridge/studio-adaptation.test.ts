import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(
  readFileSync(
    resolve(process.cwd(), ".kalp/authored/studio-adaptation.json"),
    "utf8",
  ),
);

describe("SiteBridge Studio adaptation handoff", () => {
  it("describes the canonical NestCraft homepage without claiming connection", () => {
    expect(manifest.contract).toBe("sitebridge.studio-adaptation.v1");
    expect(manifest.status).toBe("PREPARED_NOT_CONNECTED");
    expect(manifest.rendererAuthority).toBe("STOREFRONT_REPOSITORY");
    expect(manifest.pages[0].pageKey).toBe("home");
    expect(manifest.pages[0].sections).toHaveLength(14);
  });

  it("uses unique stable section IDs and renderer selectors", () => {
    const sections = manifest.pages[0].sections;
    expect(new Set(sections.map((section: { id: string }) => section.id)).size).toBe(14);
    expect(
      new Set(
        sections.map(
          (section: { rendererSelector: string }) => section.rendererSelector,
        ),
      ).size,
    ).toBe(14);
  });

  it("keeps commerce authority out of Studio-editable fields", () => {
    const editablePaths = manifest.pages[0].sections.flatMap(
      (section: { editablePaths: string[] }) => section.editablePaths,
    );
    for (const forbidden of manifest.forbiddenEditableFields) {
      expect(editablePaths).not.toContain(forbidden);
    }
  });
});
