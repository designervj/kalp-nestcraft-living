import { createAsyncThunk } from '@reduxjs/toolkit';
import { WebsiteDetailData, WebsiteDetailResponse } from './websiteDetailType';
export const fetchWebsiteDetailThunk = createAsyncThunk(
  'websiteDetail/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/website`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-db': 'kp_nestcraft',
          'tenant-slug': 'nestcraft',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch website detail');
      }
      const data: WebsiteDetailResponse = await response.json();
      console.log('Website detail fetched', data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
