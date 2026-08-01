import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HeaderCategory, HeaderData } from "./menusType";
import { fetchMenusThunk } from "./menusThunk";


interface MenusState {
  allMenus: HeaderData;
  currentMenus: HeaderCategory | null;
  isFetchedMenus: boolean;
  isLoading: boolean;
  isError: boolean;
}

const initialState: MenusState = {
  allMenus: [],
  currentMenus: null,
  isFetchedMenus: false,
  isLoading: false,
  isError: false,
};

const menusSlice = createSlice({
  name: "menus",
  initialState,
  reducers: {
    setAllMenus: (state, action: PayloadAction<HeaderData>) => {
      state.allMenus = action.payload;
      state.isFetchedMenus = true;
      state.isLoading = false;
      state.isError = false;
    },
    setCurrentMenus: (state, action: PayloadAction<HeaderCategory | null>) => {
      state.currentMenus = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.isError = action.payload;
    },
    resetMenusState: (state) => {
      state.allMenus = [];
      state.currentMenus = null;
      state.isFetchedMenus = false;
      state.isLoading = false;
      state.isError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch menus
      .addCase(fetchMenusThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchMenusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allMenus = action.payload;
        state.isFetchedMenus = true;
      })
      .addCase(fetchMenusThunk.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
  },
});

export const {
  setAllMenus,
  setCurrentMenus,
  setLoading,
  setError,
  resetMenusState,
} = menusSlice.actions;
export default menusSlice.reducer;
