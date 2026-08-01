import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { HeaderData } from "./menusType";

// Fetch all menus
export const fetchMenusThunk = createAsyncThunk<HeaderData, void, { rejectValue: string }>(
  "menus/fetchMenus",
  async (_, { rejectWithValue }) => {
    try {

      const response = await fetch("/api/commerce/menus",
       {
        method:"GET",
        headers: {
          'Content-Type': 'application/json',
          "x-tenant-db": "kp_nestcraft"
        },


      });
      if (!response.ok) {
        throw new Error("Failed to fetch menus");
      }
      const data = await response.json();
      return data.data as HeaderData;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch menus");
    }
  }
);
