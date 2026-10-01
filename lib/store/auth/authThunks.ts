import { createAsyncThunk } from "@reduxjs/toolkit";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID || "kp_nestcraft";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || "nestcraft";
const rawApiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://bizlive.kalptree.xyz").replace(/\/+$/, "");
const AUTH_API_URL = rawApiBase.endsWith("/api") ? `${rawApiBase}/auth` : `${rawApiBase}/api/auth`;

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string; keepSignedIn?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const keepSignedIn = Boolean(credentials.keepSignedIn);
      const payload = {
        tenant_slug: tenantSlug,
        keepSignedIn: keepSignedIn,
        keep_signed_in: keepSignedIn,
        ...credentials,
      };

      // Call external Auth API login directly
      let response: any = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "x-tenant-db": tenantHeader,
          "x-tenant-slug": tenantSlug,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Fallback to customer login if applicable
        try {
          const customerResponse = await fetch(`/api/auth/customer/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-tenant-db": tenantHeader,
              "x-tenant-slug": tenantSlug,
            },
            credentials: "include",
            body: JSON.stringify(payload),
          });
          if (customerResponse.ok) {
            response = customerResponse;
            data = await customerResponse.json();
          } else {
            return rejectWithValue(data.detail || data.message || "Authentication failed");
          }
        } catch {
          return rejectWithValue(data.detail || data.message || "Authentication failed");
        }
      }

      const dbName =
        data.dbname ||
        data.db_name ||
        data.dbName ||
        data.tenant_db ||
        data.session?.dbname ||
        data.session?.db_name ||
        data.session?.tenant_id ||
        tenantHeader;

      const user = data.session || data.customer || data.user;

      if (typeof document !== "undefined" && data.access_token) {
        if (keepSignedIn) {
          // Persistent cookie (30 days)
          const maxAge = 60 * 60 * 24 * 30;
          document.cookie = `${dbName}_auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `auth_token_${dbName}=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          if (data.role === "admin" || user?.role?.includes("admin")) {
            document.cookie = `admin_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          }
          try {
            localStorage.setItem("auth_token", data.access_token);
            if (user) localStorage.setItem("auth_user", JSON.stringify(user));
            localStorage.setItem("kalp_auth_keep_signed_in", "true");
          } catch {}
        } else {
          // Session cookie: no max-age/expires -> browser clears when closed
          document.cookie = `${dbName}_auth_token=${data.access_token}; path=/; SameSite=Lax`;
          document.cookie = `auth_token_${dbName}=${data.access_token}; path=/; SameSite=Lax`;
          document.cookie = `auth_token=${data.access_token}; path=/; SameSite=Lax`;
          if (data.role === "admin" || user?.role?.includes("admin")) {
            document.cookie = `admin_token=${data.access_token}; path=/; SameSite=Lax`;
          }
          try {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("kalp_auth_keep_signed_in");
            sessionStorage.setItem("auth_token", data.access_token);
            if (user) sessionStorage.setItem("auth_user", JSON.stringify(user));
          } catch {}
        }
      }

      return {
        status: response.status,
        user,
        keepSignedIn,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  },
);

export const getUserThunk = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await fetch(`/api/auth/customer/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "kp_nestcraft",
          "x-tenant-slug": tenantSlug,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Authentication failed");
      }
      return {
        status: response.status,
        user: data.session || data.customer || data,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  },
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const dbName = tenantHeader || "kp_nestcraft";
      let token: string | null = null;

      if (typeof document !== "undefined") {
        const match =
          document.cookie.match(new RegExp(`(?:^|; )${dbName}_auth_token=([^;]*)`)) ||
          document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
        if (match) token = match[1];

        // Forcibly expire all auth cookies immediately
        document.cookie = `${dbName}_auth_token=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `auth_token_${dbName}=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `auth_token=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `kalp_session=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `admin_token=; path=/; max-age=0; SameSite=Lax`;

        try {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          localStorage.removeItem("kalp_auth_keep_signed_in");
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_user");
        } catch {}
      }

      const headers: Record<string, string> = {
        "accept": "*/*",
        "Content-Type": "application/json",
        "x-tenant-db": tenantHeader,
        "x-tenant-slug": tenantSlug,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response: any = await fetch(`${AUTH_API_URL}/logout`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        // Empty or 204 response
      }

      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Authentication failed");
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  },
);

export const signupThunk = createAsyncThunk(
  "auth/signup",
  async (userData: any, { rejectWithValue }) => {
    try {
      const payload = {
        tenant_slug: tenantSlug,
        ...userData,
      };

      const response = await fetch(`/api/auth/customer/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "kp_nestcraft",
          "x-tenant-slug": tenantSlug,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Registration failed");
      }

      const dbName =
        data.dbname ||
        data.db_name ||
        data.dbName ||
        data.tenant_db ||
        data.session?.dbname ||
        data.session?.db_name ||
        data.session?.tenant_id ||
        tenantHeader ||
        "kp_nestcraft";

      if (typeof document !== "undefined" && data.access_token) {
        const maxAge = 60 * 60 * 24 * 30;
        document.cookie = `${dbName}_auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `auth_token_${dbName}=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `auth_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An unexpected error occurred during registration",
      );
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (
    {
      userData,
    }: {
      userData: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/auth/customer/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "kp_nestcraft",
          "x-tenant-slug": tenantSlug,
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Profile update failed");
      }

      return data.session || data.customer || data;
    } catch (error: any) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  },
);
