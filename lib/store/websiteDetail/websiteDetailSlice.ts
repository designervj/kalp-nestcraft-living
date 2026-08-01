import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WebsiteDetailData } from './websiteDetailType';
import { fetchWebsiteDetailThunk } from './websiteDetailThunk';

interface WebsiteDetailState {
  websiteDetail: WebsiteDetailData | null;
  authToken:string | null;
  isFetechedWebsiteDetail: boolean;
  isLoading: boolean;
  isError: boolean;
}

const initialState: WebsiteDetailState = {
  websiteDetail: null,
  authToken:null,
  isFetechedWebsiteDetail: false,
  isLoading: false,
  isError: false,
};

const websiteDetailSlice = createSlice({
  name: 'websiteDetail',
  initialState,
  reducers: {
    setWebsiteDetail: (state, action: PayloadAction<WebsiteDetailData | null>) => {
      state.websiteDetail = action.payload;
      state.isFetechedWebsiteDetail = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.isError = action.payload;
      state.isFetechedWebsiteDetail = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebsiteDetailThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchWebsiteDetailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.websiteDetail = action.payload.data;
        state.authToken = action.payload.auth_token;
        state.isFetechedWebsiteDetail = true;
      })
      .addCase(fetchWebsiteDetailThunk.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { setWebsiteDetail, setLoading, setError } = websiteDetailSlice.actions;
export default websiteDetailSlice.reducer;
