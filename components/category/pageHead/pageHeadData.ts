export const defaultSubCategories = [
  {
    id: "cat-1",
    type: "item",
    props: {
      label: { en: "Seating", hi: "बैठने की व्यवस्था" }
    }
  },
  {
    id: "cat-2",
    type: "item",
    props: {
      label: { en: "Tables", hi: "टेबल" }
    }
  },
  {
    id: "cat-3",
    type: "item",
    props: {
      label: { en: "Lighting", hi: "लाइटिंग" }
    }
  },
  {
    id: "cat-4",
    type: "item",
    props: {
      label: { en: "Decor", hi: "डेकोर" }
    }
  },
  {
    id: "cat-5",
    type: "item",
    props: {
      label: { en: "Storage", hi: "स्टोरेज" }
    }
  }
];

export const defaultPills = (productCount: number) => [
  {
    label: { en: "Items", hi: "आइटम" },
    value: "120+",
    isBold: true
  },
  {
    label: { en: "Delivery", hi: "डिलीवरी" },
    value: "Free",
    isBold: true
  },
  {
    label: { en: "Rated", hi: "रेटेड" },
    value: "Top",
    isBold: true
  }
];

export const defaultPageHeadSection = {
  id: "shop-page-head",
  type: "section",
  adminTitle: "Category Page Head",
  layout: "fullwidth",
  columns: null,
  props: {
    badge: {
      en: "Our Collection",
      hi: "हमारा संग्रह"
    },
    heading: {
      en: "The Full Collection",
      hi: "पूरा संग्रह"
    },
    description: {
      en: "Explore our entire range of design-led furniture and home essentials. Crafted with purpose, built for life.",
      hi: "डिजाइन-आधारित फर्नीचर और घर की आवश्यक वस्तुओं की हमारी पूरी श्रृंखला का अन्वेषण करें।"
    }
  },
  content: defaultSubCategories
};
