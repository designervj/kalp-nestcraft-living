import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchBusinessBlueprint,
  updateBusinessBlueprint,
} from "./businessBlueprintsThunk";

interface BusinessBlueprintPayload {
  tenant_id: string;
  tenant_slug: string;
  version: number;
  business_label: string;
  vertical_packs: string;
  enabled_modules: string[];

  admin_theme: Theme;
  public_theme: Theme;

  public_navigation: NavigationItem[];
  admin_navigation: NavigationItem[];
  commerce?: Record<string, any>;
  routes: Route[];
  dashboard_widgets: DashboardWidget;
  brandAssets: any;
  vocabulary: Vocabulary;
  mobile_capabilities: string[];
  admin_email: string;
  agency_slug: string;
  business_type: string;
  infra_mode: string;
}

// Public Theme
interface Theme {
  colors: ThemeColors;
  typography: Typography;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  background: string;
  text: string;
  buttons: ButtonColors;
}

interface ButtonColors {
  primary: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
}

// Typography
interface Typography {
  bodyFont: string;
  headingFont: string;
  customFonts: CustomFont[];
}

interface CustomFont {
  id: string;
  name: string;
  url: string;
  weight: string;
  style: string;
}

// Navigation
interface NavigationItem {
  label: string;
  href: string;
  kind: "link" | "cta" | "module";
  icon: string;
}

// Routes
interface Route {
  key: string;
  path: string;
  page_slug: string;
  visibility: "public" | "private";
}

// Dashboard Widgets
interface DashboardWidget {
  key: string;
  title: string;
  metric: string;
  description: string;
}

// Vocabulary
interface Vocabulary {
  customer: string;
  order: string;
  booking: string;
  staff: string;
  location: string;
}

export interface BusinessBlueprint {
  id: string;
  tenant_slug: string;
  document_key: string;
  payload: BusinessBlueprintPayload;
  updatedAt?: string;
}

interface BusinessBlueprintState {
  businessBlueprint: BusinessBlueprint | null;
  isLoading: boolean;
  error: string | null;
  hasBlueprintFetched: boolean;
  activeThemeMode: "admin" | "public"; // NEW: Track which theme is active
}

const initialState: BusinessBlueprintState = {
  businessBlueprint: null,
  isLoading: false,
  error: null,
  hasBlueprintFetched: false,
  activeThemeMode: "admin", // NEW: Default to admin theme
};

const businessBlueprintSlice = createSlice({
  name: "businessBlueprint",
  initialState,
  reducers: {
    setBusinessBlueprint: (state, action: PayloadAction<BusinessBlueprint>) => {
      state.businessBlueprint = action.payload;
      state.hasBlueprintFetched = true;
      state.isLoading = false;
      state.error = null;
    },

    // NEW: Toggle between admin and public theme
    setActiveThemeMode: (state, action: PayloadAction<"admin" | "public">) => {
      state.activeThemeMode = action.payload;
    },

    // NEW: Update theme colors
    updateThemeColors: (
      state,
      action: PayloadAction<{
        mode: "admin" | "public";
        colors: Partial<ThemeColors>;
      }>,
    ) => {
      if (!state.businessBlueprint) return;

      const themeKey =
        action.payload.mode === "admin" ? "admin_theme" : "public_theme";
      state.businessBlueprint.payload[themeKey].colors = {
        ...state.businessBlueprint.payload[themeKey].colors,
        ...action.payload.colors,
      };
    },

    // NEW: Update button colors specifically
    updateButtonColors: (
      state,
      action: PayloadAction<{
        mode: "admin" | "public";
        buttonColors: Partial<ButtonColors>;
      }>,
    ) => {
      if (!state.businessBlueprint) return;

      const themeKey =
        action.payload.mode === "admin" ? "admin_theme" : "public_theme";
      state.businessBlueprint.payload[themeKey].colors.buttons = {
        ...state.businessBlueprint.payload[themeKey].colors.buttons,
        ...action.payload.buttonColors,
      };
    },

    // NEW: Update typography
    updateTypography: (
      state,
      action: PayloadAction<{
        mode: "admin" | "public";
        typography: Partial<Typography>;
      }>,
    ) => {
      if (!state.businessBlueprint) return;

      const themeKey =
        action.payload.mode === "admin" ? "admin_theme" : "public_theme";
      state.businessBlueprint.payload[themeKey].typography = {
        ...state.businessBlueprint.payload[themeKey].typography,
        ...action.payload.typography,
      };
    },

    // NEW: Add custom font
    addCustomFont: (
      state,
      action: PayloadAction<{
        mode: "admin" | "public";
        font: CustomFont;
      }>,
    ) => {
      if (!state.businessBlueprint) return;

      const themeKey =
        action.payload.mode === "admin" ? "admin_theme" : "public_theme";
      state.businessBlueprint.payload[themeKey].typography.customFonts.push(
        action.payload.font,
      );
    },

    // NEW: Remove custom font
    removeCustomFont: (
      state,
      action: PayloadAction<{
        mode: "admin" | "public";
        fontId: string;
      }>,
    ) => {
      if (!state.businessBlueprint) return;

      const themeKey =
        action.payload.mode === "admin" ? "admin_theme" : "public_theme";
      state.businessBlueprint.payload[themeKey].typography.customFonts =
        state.businessBlueprint.payload[themeKey].typography.customFonts.filter(
          (font) => font.id !== action.payload.fontId,
        );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessBlueprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessBlueprint.fulfilled, (state, action) => {
        state.businessBlueprint = action.payload;
        state.hasBlueprintFetched = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchBusinessBlueprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasBlueprintFetched = true;
      })
      .addCase(updateBusinessBlueprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessBlueprint.fulfilled, (state, action) => {
        state.businessBlueprint = action.payload;
        state.hasBlueprintFetched = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateBusinessBlueprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasBlueprintFetched = true;
      });
  },
});

export const {
  setBusinessBlueprint,
  setActiveThemeMode,
  updateThemeColors,
  updateButtonColors,
  updateTypography,
  addCustomFont,
  removeCustomFont,
} = businessBlueprintSlice.actions;

export default businessBlueprintSlice.reducer;
