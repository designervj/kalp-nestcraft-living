import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cart/cartSlice";
// import adminProductsReducer from "./features/adminProductsSlice";
import adminAttributesReducer from "./features/adminAttributesSlice";
import adminVariantsReducer from "./features/adminVariantsSlice";
import adminOrdersReducer from "./features/adminOrdersSlice";
import pagesReducer from "./pages/pagesSlice";
import commentsReducer from "./comments/commentSlice";
import authReducer from "./auth/authSlice";
import categoryReducer from "./categories/categoriesSlices";
import productsReducer from "./products/productsSlices";
import attributesReducer from "./attributes/attributeSlices";
import wishlistReducer from "./wishlist/wishlistSlice";
import ordersReducer from "./orders/ordersSlice";
import websiteDetailReducer from "./websiteDetail/websiteDetailSlice";
import MenusReducer from "./menus/menusSlice";
import formsReducer from "./forms/formsSlice";
import adminUsersReducer from "./users/userSlice";
import adminFormsReducer from "./forms/formsSlice";
import brandingReducer from "./branding/brandingSlice";
import businessBlueprintReducer from "./businessBlueprints/businessBlueprintSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      pages: pagesReducer,
      menus: MenusReducer,
      comments: commentsReducer,
      cart: cartReducer,
      forms: formsReducer,
      adminProducts: productsReducer,
      adminCategories: categoryReducer,
      adminAttributes: attributesReducer,
      adminVariants: adminVariantsReducer,
      adminOrders: adminOrdersReducer,
      wishlist: wishlistReducer,
      orders: ordersReducer,
      websiteDetail: websiteDetailReducer,

      adminUsers: adminUsersReducer,
      adminForms: adminFormsReducer,
      branding: brandingReducer,
      businessBlueprint: businessBlueprintReducer,
    },
    devTools: {
      name: "Nestcraft Living",
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
