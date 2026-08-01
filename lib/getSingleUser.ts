import { cookies } from "next/headers";
import { cache } from "react";

function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export const getAuthUser = cache(async (token: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-db": tenantId || "",
      } as HeadersInit,
    });

    const data = await res.json();
    return serialize(data);
  } catch (error) {
    console.error("Error fetching auth user:", error);
    return null;
  }
});
