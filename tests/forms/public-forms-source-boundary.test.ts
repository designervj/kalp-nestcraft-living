import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const publicSources = [
  "components/homepage/newsletter/Newsletter.tsx",
  "components/contactpage/contactForm/ContactForm.tsx",
  "components/forms/FormComp.tsx",
  "components/forms/GetAllForms.tsx",
  "lib/store/forms/formsThunk.ts",
].map((path) => fs.readFileSync(path, "utf8")).join("\n");

describe("public Forms source boundary", () => {
  it("contains no authenticated discovery, legacy submission endpoint, or hard-coded Mongo form ID", () => {
    expect(publicSources).not.toContain('fetch("/api/forms"');
    expect(publicSources).not.toContain('fetch("/api/form-data"');
    expect(publicSources).not.toMatch(/["'][a-f0-9]{24}["']/i);
    expect(publicSources).toContain("NEXT_PUBLIC_NEWSLETTER_FORM_ID");
    expect(publicSources).toContain("NEXT_PUBLIC_CONTACT_FORM_ID");
    expect(publicSources).toContain("NEXT_PUBLIC_TENANT_SLUG");
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
