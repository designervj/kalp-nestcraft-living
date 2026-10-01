/**
 * @deprecated
 * This file is kept only for backward compatibility.
 * All thunks now live in `lib/store/features/adminCategoriesSlice.ts`.
 * Please import directly from there going forward.
 */

export {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkImportCategories,
} from "../features/adminCategoriesSlice";

export type { CategoryRecord, CategoryType } from "../features/adminCategoriesSlice";
