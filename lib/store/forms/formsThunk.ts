import { createAsyncThunk } from "@reduxjs/toolkit";
import { FormsData, FormSubmit } from "./formsType";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetch all forms
export const fetchAllForm = createAsyncThunk<
  FormsData[],
  void,
  { rejectValue: string }
>("forms/fetchAllForm", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/forms", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Adding x-tenant-db as seen in other thunks if applicable
        "x-tenant-db": tenantHeader!,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch forms");
    }

    const data = await response.json();

    console.log("get all forms", data.data);
    // Assuming the API returns an array or an object with a data property
    return (data.data || data) as FormsData[];
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch forms");
  }
});

export const subMitFormData = createAsyncThunk<
  FormSubmit,
  any,
  { rejectValue: string }
>("forms/subMitFormData", async (payload, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/form-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Adding x-tenant-db as seen in other thunks if applicable
        "x-tenant-db": tenantHeader!,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to submit form data");
    }

    const data = await response.json();
    // Assuming the API returns an array or an object with a data property
    return (data.data || data) as FormSubmit;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch forms");
  }
});
