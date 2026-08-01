import { createAsyncThunk } from "@reduxjs/toolkit";
import { getOrders, getOrderById } from "@/lib/services/orders";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ userId }: { userId: string }, { rejectWithValue }) => {
    try {
      const orders = await getOrders(userId);
      return orders;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch orders");
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      const order = await getOrderById(id);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch order details");
    }
  },
);
