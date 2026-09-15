import { Annotation } from '@/components/annotationPlugin';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createCommentThunk, fetchCommentsThunk, updateCommentThunk, deleteCommentThunk } from './commentThunk';

const upsertComment = (comments: Annotation[], comment: Annotation) => {
  const key = comment._id ?? comment.id;
  if (!key) return [...comments, comment];
  const exists = comments.some((item) => (item._id ?? item.id) === key);
  return exists
    ? comments.map((item) => ((item._id ?? item.id) === key ? comment : item))
    : [...comments, comment];
};

interface CommentState {
  allComments: Annotation[];
  pageComments: Annotation[];
  isFetchedComments: boolean;
  isError: boolean;
  isLoading: boolean;
}

const initialState: CommentState = {
  allComments: [],
  pageComments: [],
  isFetchedComments: false,
  isError: false,
  isLoading: false,
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setAllComments: (state, action: PayloadAction<Annotation[]>) => {
      state.allComments = action.payload;
      state.isFetchedComments = true;
      state.isLoading = false;
      state.isError = false;
    },
    setPageComments: (state, action: PayloadAction<Annotation[]>) => {
      state.pageComments = action.payload;
    },
    resetPageComments: (state) => {
        state.pageComments = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.isError = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder.
    addCase(createCommentThunk.fulfilled, (state, action: PayloadAction<Annotation>) => {
      const data = action.payload;
      state.allComments = upsertComment(state.allComments, data);
      state.pageComments = upsertComment(state.pageComments, data);
      state.isLoading = false;
      state.isError = false;
    })
    .addCase(createCommentThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
    })
    .addCase(createCommentThunk.pending, (state, action) => {
      state.isLoading = true;
      state.isError = false;
    })

    // add all comment
    .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
      state.allComments = action.payload;
      state.isFetchedComments = true;
      state.isLoading = false;
      state.isError = false;
    })
    .addCase(fetchCommentsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
    })

    // Update comment
    .addCase(updateCommentThunk.fulfilled, (state, action: PayloadAction<Annotation>) => {
      const updatedComment = action.payload;
      state.allComments = state.allComments.map(c => c._id === updatedComment._id ? updatedComment : c);
      state.pageComments = state.pageComments.map(c => c._id === updatedComment._id ? updatedComment : c);
      state.isLoading = false;
      state.isError = false;
    })
    .addCase(updateCommentThunk.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
    })
    .addCase(updateCommentThunk.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
    })

    // Delete comment
    .addCase(deleteCommentThunk.fulfilled, (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.allComments = state.allComments.filter(c => c._id !== id);
      state.pageComments = state.pageComments.filter(c => c._id !== id);
      state.isLoading = false;
      state.isError = false;
    })
    .addCase(deleteCommentThunk.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
    })
    .addCase(deleteCommentThunk.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
    });
  },
});

export const { setAllComments, setPageComments, setLoading, setError ,resetPageComments} = commentSlice.actions;
export default commentSlice.reducer;
