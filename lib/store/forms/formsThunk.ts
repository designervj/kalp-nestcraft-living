import { createAsyncThunk } from "@reduxjs/toolkit";
import { FormsData, FormSubmit } from "./formsType";
import { submitPublicForm } from "@/lib/forms/public-forms-client";

const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG;

// Fetch all forms
export const fetchAllForm = createAsyncThunk<
  FormsData[],
  void,
  { rejectValue: string }
>("forms/fetchAllForm", async (_, { rejectWithValue }) => {
  return rejectWithValue(
    "Public form discovery is disabled. Bind an approved form ID through CMS or deployment configuration.",
  );
});

export const subMitFormData = createAsyncThunk<
  FormSubmit,
  any,
  { rejectValue: string }
>("forms/subMitFormData", async (payload, { rejectWithValue }) => {
  try {
    const data = await submitPublicForm({
      tenantSlug,
      formId: payload?.formId,
      submission: {
        data: payload?.data || {},
        consent: payload?.consent || {},
        metadata: payload?.metadata || {},
        honeypot: payload?.honeypot || "",
        idempotencyKey: payload?.idempotencyKey || `nestcraft-form-${crypto.randomUUID()}`,
      },
    });
    return data as FormSubmit;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch forms");
  }
});
