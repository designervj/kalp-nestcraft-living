import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AdminOrdersState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminOrdersState = {
  items: [],
  loading: true,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'adminOrders/fetchOrders',
  async () => {
    const response = await fetch(`${API_BASE_URL}/commerce/orders`, {
      headers: {
        "x-tenant-db": tenantHeader || "",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
);


const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading orders';
      });
  },
});

export const selectAdminOrders = (state: { adminOrders: AdminOrdersState }) => state.adminOrders.items;
export const selectAdminOrdersLoading = (state: { adminOrders: AdminOrdersState }) => state.adminOrders.loading;
export const selectAdminOrdersError = (state: { adminOrders: AdminOrdersState }) => state.adminOrders.error;

export default adminOrdersSlice.reducer;
