import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage hero CMS values", () => {
  it("normalizes localized image fields through the shared hero value resolver", () => {
    const source = readFileSync(
      "components/homepage/hero/MainHeroSlider.tsx",
      "utf8",
    );

    expect(source).toContain("image: getLocalizedHeroValue(p.image, lang)");
    expect(source).toContain("value[lang] || value.en");
  });
});
