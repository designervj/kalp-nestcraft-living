import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "@/middleware";

describe("single-language middleware", () => {
  it("rewrites the public root without an internal trailing slash", async () => {
    const response = await middleware(
      new NextRequest("http://localhost:3100/"),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3100/en",
    );
    expect(response.headers.get("location")).toBeNull();
  });

  it("rewrites clean public paths into the default locale", async () => {
    const response = await middleware(
      new NextRequest("http://localhost:3100/shop"),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3100/en/shop",
    );
  });

  it("redirects an explicit default-locale path to its clean URL", async () => {
    const response = await middleware(
      new NextRequest("http://localhost:3100/en/shop"),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3100/shop",
    );
  });

  it("does not redirect the internal localized rewrite", async () => {
    const response = await middleware(
      new NextRequest("http://localhost:3100/en", {
        headers: {
          "x-nestcraft-internal-locale": "en",
        },
      }),
    );

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
