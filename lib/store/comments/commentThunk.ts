import { createAsyncThunk } from '@reduxjs/toolkit';
import { Annotation } from '@/components/annotationPlugin';

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;

function extractComments(data: any): Annotation[] {
  const value = data?.pages ?? data?.comments ?? data?.data?.pages ?? data?.data?.comments ?? data?.data ?? [];
  return Array.isArray(value) ? value.map(normalizeComment) : [];
}

function extractComment(data: any): Annotation {
  const value = data?.comment ?? data?.data?.comment ?? data?.page ?? data?.data?.page ?? data?.data ?? data;
  if (!value || typeof value !== 'object') {
    throw new Error('Comment response was invalid');
  }
  return normalizeComment(value as Annotation & { pageSlug?: string; id?: string });
}

function normalizeComment(comment: Annotation & { pageSlug?: string; id?: string }): Annotation {
  return {
    ...comment,
    _id: comment._id ?? comment.id,
    slug: comment.slug ?? comment.pageSlug,
  };
}

function toCreatePayload(comment: Partial<Annotation>) {
  return {
    pageSlug: comment.slug,
    pageId: comment.pageId || null,
    selector: comment.selector,
    offsetX: comment.offsetX,
    offsetY: comment.offsetY,
    content: comment.content,
    status: comment.status || 'open',
    screenSize: comment.screenSize || 'all',
  };
}

function toUpdatePayload(id: string, comment: Partial<Annotation>) {
  return {
    id,
    selector: comment.selector,
    offsetX: comment.offsetX,
    offsetY: comment.offsetY,
    content: comment.content,
    status: comment.status,
    screenSize: comment.screenSize,
  };
}

// Fetch all comments
export const fetchCommentsThunk = createAsyncThunk(
  'comments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comments`, {
        headers: {
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || errorData.error || 'Failed to fetch comments');
      }
      const data = await response.json();
      return extractComments(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch comments by page
export const fetchCommentsByPageThunk = createAsyncThunk(
  'comments/fetchByPage',
  async (pageId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comments?pageId=${pageId}`, {
        headers: {
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || errorData.error || 'Failed to fetch page comments');
      }
      const data = await response.json();
      return extractComments(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new comment
export const createCommentThunk = createAsyncThunk(
  'comments/create',
  async (commentData: Partial<Annotation>, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify(toCreatePayload(commentData)),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || errorData.error || 'Failed to create comment');
      }
      const data = await response.json();
      return { ...commentData, ...extractComment(data) } as Annotation;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update a comment
export const updateCommentThunk = createAsyncThunk(
  'comments/update',
  async ({ id, commentData }: { id: string; commentData: Partial<Annotation> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify(toUpdatePayload(id, commentData)),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || errorData.error || 'Failed to update comment');
      }
      const data = await response.json();
      return { ...commentData, ...extractComment(data) } as Annotation;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a comment
export const deleteCommentThunk = createAsyncThunk(
  'comments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comments?id=${id}`, {
        method: 'DELETE',
        headers: {
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || errorData.error || 'Failed to delete comment');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
