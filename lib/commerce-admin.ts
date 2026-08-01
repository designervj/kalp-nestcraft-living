import type { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth";

const COMMERCE_ADMIN_ROLES = new Set(["admin", "tenant_admin"]);

type AuthorizedCommerceAdmin = {
  authorized: true;
  principal: JwtPayload;
};

type RejectedCommerceAdmin = {
  authorized: false;
  response: NextResponse;
};

export type CommerceAdminAuthorization =
  | AuthorizedCommerceAdmin
  | RejectedCommerceAdmin;

export async function authorizeCommerceAdmin(): Promise<CommerceAdminAuthorization> {
  const principal = await authenticateAdmin();

  if (!principal) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (
    typeof principal !== "object" ||
    typeof principal.role !== "string" ||
    !COMMERCE_ADMIN_ROLES.has(principal.role)
  ) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { authorized: true, principal };
}
