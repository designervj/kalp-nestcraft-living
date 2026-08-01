export interface WebsiteDetailResponse {
  data: WebsiteDetailData;
  success: boolean;
  auth_token: string;
}

export interface WebsiteDetailData {
  id: string;
  document_key: string;
  tenant_slug: string;
  payload: WebsiteDetailPayload;
  updatedAt: string;
}

export interface WebsiteDetailPayload {
  tenant_id: string;
  tenant_slug: string;
  version: number;
  business_label: string;
  vertical_packs: string;
  enabled_modules: string[];
  public_theme: any | null;
  admin_theme: any | null;
  public_navigation: any | null;
  admin_navigation: any | null;
  routes: any | null;
  dashboard_widgets: any | null;
  vocabulary: any | null;
  mobile_capabilities: any | null;
  admin_email: string;
  agency_slug: string;
  business_type: string;
  infra_mode: string;
  branding: any | null;
  commerce: CommerceConfig;
  businessProfile: BusinessProfile;
  brandAssets: BrandAssets;
  brandValue: BrandValue;
  localization: Localization;
  storeConfiguration: string | any;
  currenciesAndTaxes: string | any;
  paymentProviders: string | any;
  shippingRegions: string | any;
  checkoutPolicies: string | any;
 analytics_tracking: {
 googleAnalytics: {
    measurementId: "",
    enabled: false,
    enhancedEcommerce: false,
    debugMode: false,
  },
  metaPixel: {
    pixelId: "",
    enabled: false,
    conversionsApiToken: "",
    testEventCode: "",
  },
  jsonConfig: "",
  parameters: [],
}
}

export interface CommerceConfig {
  storeConfig: {
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    taxRegistration: {
      type: string;
      number: string;
      legalEntity: string;
    };
    orderNumber: {
      prefix: string;
      suffix: string;
      padding: number;
      nextNumber: number;
    };
  };
  currenciesTaxes: {
    currency: {
      baseCurrency: string;
    };
    formatting: {
      symbolPosition: string;
      thousandsSeparator: string;
      decimalSeparator: string;
      decimalPlaces: number;
    };
    tax: {
      pricesIncludeTax: boolean;
      taxRules: TaxRule[];
    };
  };
  paymentProviders: {
    gateways: PaymentGateway[];
    manualMethods: ManualPaymentMethod[];
  };
  shippingRegions: {
    localFulfillment: {
      localPickup: boolean;
      localDelivery: boolean;
    };
    freeShipping: {
      threshold: number;
    };
    zones: ShippingZone[];
  };
  checkoutPolicies: {
    customerAccounts: {
      guestCheckout: boolean;
      requireAccount: boolean;
      marketingOptIn: boolean;
    };
    requiredFields: {
      requirePhone: boolean;
      requireCompany: boolean;
    };
    policies: {
      refund: Policy;
      shipping: Policy;
      terms: Policy;
      privacy: Policy;
    };
  };
}

export interface TaxRule {
  id: string;
  label: string;
  rate: number;
  region: string;
  inclusive: boolean;
  enabled: boolean;
}

export interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  publicKey: string;
  testMode: boolean;
}

export interface ManualPaymentMethod {
  id: string;
  label: string;
  instructions: string;
  enabled: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  rateType: string;
  flatRate: number;
  weightRate: number;
  enabled: boolean;
}

export interface Policy {
  label: string;
  url: string;
}

export interface BusinessProfile {
  businessInfo: {
    tradingName: string;
    industry: string;
    legalName: string;
    foundedDate: string;
  };
  communications: {
    supportEmail: string;
    salesEmail: string;
    pressEmail: string;
    primaryEmail: string;
  };
  contactInfo: {
    primaryPhone: string;
    whatsapp: string;
    website: string;
    workingHours: string;
  };
  legalRegulatory: {
    registrationNumber: string;
    taxId: string;
  };
}

export interface BrandAssets {
  admin: BrandTheme;
  public: BrandTheme;
  logo: string;
  icon: string;
}

export interface BrandTheme {
  colors: {
    core: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
    };
    buttons: {
      primary: string;
      primaryText: string;
      secondary: string;
      secondaryText: string;
    };
  };
  typography: {
    bodyFont: string;
    headingFont: string;
    customFonts: any[];
  };
}

export interface BrandValue {
  coreValues: CoreValue[];
  taglines: {
    primary: string;
    secondary: string;
    short: string;
  };
  socialLinks: SocialLink[];
}

export interface CoreValue {
  id: string;
  name: string;
  tags: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Localization {
  languages: {
    available: Language[];
    default: string;
  };
  currencies: {
    available: Currency[];
    default: string;
  };
}

export interface Language {
  code: string;
  name: string;
  enabled: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
}
