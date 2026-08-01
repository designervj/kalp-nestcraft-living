import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormsData } from "./formsType";
import { fetchAllForm } from "./formsThunk";

interface FormsState {
  allForms: FormsData[];
  isFetchedForms: boolean;
  currentForms: FormsData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FormsState = {
  allForms: [],
  isFetchedForms: false,
  currentForms: null,
  isLoading: false,
  error: null,
};

export const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    setAllForms: (state, action: PayloadAction<FormsData[]>) => {
      state.allForms = action.payload;
      state.isFetchedForms = true;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentForms: (state, action: PayloadAction<FormsData | null>) => {
      state.currentForms = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetFormsState: (state) => {
      state.allForms = [];
      state.isFetchedForms = false;
      state.currentForms = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllForm.fulfilled, (state, action: PayloadAction<FormsData[]>) => {
        state.isLoading = false;
        state.allForms = action.payload;
        state.isFetchedForms = true;
      })
      .addCase(fetchAllForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAllForms,
  setCurrentForms,
  setLoading,
  setError,
  resetFormsState,
} = formsSlice.actions;

export default formsSlice.reducer;
