import { createSlice } from "@reduxjs/toolkit";
import { addUser, deleteUser, fetchUsers, updateUser } from "./usersThunk";

export interface CustomerAddress {
  _id: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

interface UserBase {
  _id?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CustomerBase extends UserBase {
  phone: string;
  addresses: CustomerAddress[];
}

interface AdminBase extends UserBase {
  tenantKey: string;
  isTenantOwner: boolean;
}

interface AdminUsersState {
  customers: CustomerBase[];
  adminusers: AdminBase[];
  loading: boolean;
  error: string | null;
  totalCustomers: number;
  hasFetchedCustomers: boolean;
  hasFetchedAdminUsers: boolean;
}

const initialState: AdminUsersState = {
  customers: [],
  adminusers: [],
  loading: false,
  error: null,
  totalCustomers: 0,
  hasFetchedCustomers: false,
  hasFetchedAdminUsers: false,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.type === "customer") {
          state.customers = action.payload.customers;
          state.totalCustomers = action.payload.totalCustomers;
          state.hasFetchedCustomers = true;
        } else {
          state.adminusers = action.payload.users;
          state.hasFetchedAdminUsers = true;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        if (action.payload.type === "customer") {
          state.customers.unshift(action.payload.data);
          state.totalCustomers++;
        } else {
          state.adminusers.unshift(action.payload.data);
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const { id, userData } = action.payload;

        // Update in customers
        const customerIndex = state.customers.findIndex((c) => c._id === id);
        if (customerIndex !== -1) {
          state.customers[customerIndex] = {
            ...state.customers[customerIndex],
            ...userData,
          };
        }

        // Update in adminusers
        const adminIndex = state.adminusers.findIndex((u) => u._id === id);
        if (adminIndex !== -1) {
          state.adminusers[adminIndex] = {
            ...state.adminusers[adminIndex],
            ...userData,
          };
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const id = action.payload;
        state.customers = state.customers.filter((c) => c._id !== id);
        state.adminusers = state.adminusers.filter((u) => u._id !== id);
      });
  },
});

export default usersSlice.reducer;
