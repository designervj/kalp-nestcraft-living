import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PublicFormConfigurationError,
  submitPublicForm,
} from "@/lib/forms/public-forms-client";
import { getNetworkAttemptCount } from "../setup/network-guard";

describe("Nestcraft public Forms client", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("fails visibly before a network request when owner configuration is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(submitPublicForm({
      tenantSlug: "nestcraft",
      formId: "",
      submission: { data: { email: "visitor@example.test" }, idempotencyKey: "newsletter-attempt-001" },
    })).rejects.toBeInstanceOf(PublicFormConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("uses the tenant-qualified endpoint and preserves one attempt key across retries", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ data: { id: "submission-1", status: "received" }, success: true }, { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const submission = {
      data: { email: "visitor@example.test" },
      consent: {},
      metadata: { source: "nestcraft-home-newsletter" },
      honeypot: "",
      idempotencyKey: "newsletter-attempt-001",
    };

    await submitPublicForm({ tenantSlug: "nestcraft", formId: "newsletter-form", submission });
    await submitPublicForm({ tenantSlug: "nestcraft", formId: "newsletter-form", submission });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [url, options] of fetchMock.mock.calls) {
      expect(url).toBe("/api/forms/public/nestcraft/newsletter-form/submissions");
      expect((options as RequestInit).credentials).toBe("include");
      expect(JSON.parse(String((options as RequestInit).body))).toEqual(submission);
    }
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
