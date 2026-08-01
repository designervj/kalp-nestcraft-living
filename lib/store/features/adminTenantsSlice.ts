import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AdminTenantsState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminTenantsState = {
  items: [],
  loading: true,
  error: null,
};

export const fetchTenants = createAsyncThunk(
  'adminTenants/fetchTenants',
  async () => {
    const response = await fetch(`${API_BASE_URL}/admin/tenants`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
);


const adminTenantsSlice = createSlice({
  name: 'adminTenants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading tenants';
      });
  },
});

export const selectAdminTenants = (state: { adminTenants: AdminTenantsState }) => state.adminTenants.items;
export const selectAdminTenantsLoading = (state: { adminTenants: AdminTenantsState }) => state.adminTenants.loading;
export const selectAdminTenantsError = (state: { adminTenants: AdminTenantsState }) => state.adminTenants.error;

export default adminTenantsSlice.reducer;
