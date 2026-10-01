/**
 * @deprecated
 * This file is kept only for backward compatibility.
 * All category state now lives in `lib/store/features/adminCategoriesSlice.ts`.
 * Please import directly from there going forward.
 */

export {
  default,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkImportCategories,
  setAllCategories,
  resetCategoriesFetch,
  selectAllCategories,
  selectCategoryLoading,
  selectCategoryError,
  selectHasCategoriesFetched,
  selectProductCategories,
  selectAdminCategories,
  selectAdminCategoriesLoading,
  selectAdminCategoriesError,
} from "../features/adminCategoriesSlice";

export type { CategoryRecord, CategoryType } from "../features/adminCategoriesSlice";
