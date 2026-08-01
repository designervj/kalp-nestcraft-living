import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/apiProxy";
import { authorizeCommerceAdmin } from "@/lib/commerce-admin";

const CATALOG_MUTATION_RESOURCES = new Set([
  "products",
  "categories",
  "attributes",
  "attribute-sets",
  "variants",
  "upload",
]);

function isCatalogMutation(req: NextRequest, slug: string[]) {
  return (
    slug[0] === "commerce" &&
    CATALOG_MUTATION_RESOURCES.has(slug[1] ?? "") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  );
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

async function handleProxy(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await context.params;

  if (!slug || slug.length === 0) {
    return NextResponse.json({ error: "Invalid API endpoint" }, { status: 404 });
  }

  if (isCatalogMutation(req, slug)) {
    const authorization = await authorizeCommerceAdmin();
    if (!authorization.authorized) return authorization.response;
  }

  const base = slug[0];
  const rest = slug.slice(1).join("/");

  // Mapping logic
  let targetPath = slug.join("/");
  let addApiPrefix = false;

  // if (base === "commerce") {
  //   addApiPrefix = false;
  // } else

  if (base === "commerce") {
    targetPath = "commerce/" + rest;
  } else if (base === "form-data") {
    // If Newsletter calls /api/form-data, we might need to map it to backend /form_data
    // or just let it pass through if the backend endpoint is actually /form-data
    targetPath = "form-data";
  }

  const response = await proxyRequest(req, targetPath, { addApiPrefix });

  // Rotate cart_session_id cookie after successfully clearing the cart
  if (
    req.method === "DELETE" &&
    slug.length >= 2 &&
    slug[0] === "commerce" &&
    slug[1] === "cart" &&
    req.nextUrl.searchParams.get("clear") === "true"
  ) {
    response.headers.append(
      "Set-Cookie",
      `cart_session_id=${crypto.randomUUID()}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}Max-Age=${60 * 60 * 24 * 30}; Path=/`,
    );
  }

  return response;
}
