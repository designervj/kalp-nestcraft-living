import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchBrandingThunk, saveBrandingThunk } from "./brandingThunks";

export interface Logo {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  foundedYear: string;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  isPrimary: boolean;
}

export interface ContactInfo {
  primaryEmail: string;
  supportEmail: string;
  phoneDisplay: boolean;
}

export interface SocialMedia {
  platform: string;
  url: string;
  icon: string;
  enabled: boolean;
}

export interface LegalInfo {
  companyLegalName: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  copyrightText: string;
}

export interface Language {
  code: string;
  name: string;
  enabled: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  enabled: boolean;
}

export interface LanguageConfig {
  available: Language[];
  default: string;
}

export interface CurrencyConfig {
  available: Currency[];
  default: string;
}

export interface BrandConfiguration {
  logos: Logo[];
  companyInfo: CompanyInfo;
  locations: Location[];
  contact: ContactInfo;
  socialMedia: SocialMedia[];
  legal: LegalInfo;
  languages: LanguageConfig;
  currencies: CurrencyConfig;
}

interface BrandingState {
  config: BrandConfiguration | null;
  isLoading: boolean;
  error: string | null;
  currencyselector: null | string;
}

const initialState: BrandingState = {
  config: null,
  isLoading: false,
  error: null,
  currencyselector: null,
};

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {
    setBranding: (state, action: PayloadAction<BrandConfiguration>) => {
      state.config = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateBrandingState: (
      state,
      action: PayloadAction<Partial<BrandConfiguration>>,
    ) => {
      if (state.config) {
        state.config = { ...state.config, ...action.payload };
      }
    },
    setBrandingLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setBrandingError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setCurrenyCurrency: (state, action: PayloadAction<string | null>) => {
      if (!state.config?.companyInfo.name) return;
      localStorage.setItem(
        state.config?.companyInfo.name,
        String(action.payload),
      );
      state.currencyselector = action.payload;
    },
    loadCurrencyFromStorage: (state) => {
      if (!state.config?.companyInfo.name) return;
      const stored = String(
        localStorage.getItem(state.config?.companyInfo.name)!,
      );
      if (stored != "null") {
        state.currencyselector = stored;
      } else {
        localStorage.setItem(
          state.config?.companyInfo.name,
          String(state.config.currencies.default),
        );
        state.currencyselector = state.config.currencies.default;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandingThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrandingThunk.fulfilled, (state, action) => {
        state.config = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchBrandingThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveBrandingThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveBrandingThunk.fulfilled, (state, action) => {
        state.config = action.payload; // Update state with filtered payload
        state.isLoading = false;
        state.error = null;
      })
      .addCase(saveBrandingThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setBranding,
  updateBrandingState,
  setBrandingLoading,
  setBrandingError,
  setCurrenyCurrency,
  loadCurrencyFromStorage,
} = brandingSlice.actions;
export default brandingSlice.reducer;
