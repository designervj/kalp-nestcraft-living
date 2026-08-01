import { createAsyncThunk } from "@reduxjs/toolkit";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response: any = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Authentication failed");
      }

      return {
        status: response.status,
        user: data.session,
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
      const response: any = await fetch(`/api/auth/login`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Authentication failed");
      }
      return {
        status: response.status,
        user: data.session,
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
      const response: any = await fetch(`/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });

      const data = await response.json();

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
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "kp_nestcraft",
        },
        body: JSON.stringify(userData),
      });
      console.log("response -sign ",response)

      const data = await response.json();
        console.log("data sign up",data)
      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Registration failed");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An unexpected error occurred during recruitment",
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
    { rejectWithValue, getState },
  ) => {
    try {
      const { auth } = getState() as any;

      const response = await fetch(`/api/auth/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify({ ...userData, id: auth.user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || data.message || "Profile update failed");
      }

      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  },
);
