# NestCraft Ecommerce: Architecture & Implementation Blueprint (Strict Specification v1.0)

This document is the **single source of truth** for the NestCraft Ecommerce system. It defines the technical standards, architectural patterns, and design specifications required to build, maintain, and scale the premium furniture ecommerce experience. This blueprint ensures that the ecommerce module remains modular, schema-driven, and perfectly aligned with the NestCraft brand identity.

---

## 1. Technology Stack

- **Frontend Framework**: Next.js (App Router)
- **Routing**: Dynamic `[locale]` segments (e.g., `/en/ecommerce`, `/hi/ecommerce`).
- **Styling**: Tailwind CSS + Framer Motion (for layout & high-end animations).
- **Design Tokens**: Centralized CSS variables and classes in `globals.css`.
- **Data Architecture**: Schema-driven JSON content with full localization support.
- **Media**: Cloudinary-ready image handling for performance and responsiveness.
- **Type Safety**: TypeScript-first implementation for all components and data structures.

---

## 2. Ecommerce CMS Architecture

The architecture follows a **Modular Section Pattern** where pages are composed of independent, self-contained sections.

### 2.1 The `{ type, value }` Core
Every prop in our ecommerce components follows the self-describing CMS pattern:
```json
"title": {
  "type": "text",
  "value": { "en": "Modern Living", "hi": "आधुनिक जीवन" }
}
```

### 2.2 Multilingual Prop Resolution
Components must never hardcode text. Content is resolved dynamically based on the active locale:
```tsx
// Using getV(field, lang) helper
const title = getV(props.title, lang);
```

---

## 3. Dynamic Section Rendering System

The ecommerce page is a single entry point that renders a list of sections defined in a JSON layout.

1. **Layout Fetching**: The page fetches the `ecommerce.json` layout.
2. **Component Mapping**: The `DynamicRenderer` iterates over the `content` array.
3. **Registry Resolution**: Each section type is mapped to a React component via the `ecommerceRegistry`.
4. **Isolated Props**: Each section receives only its specific `props` and `content`.

---

## 4. Section Registry System

The registry maps section string identifiers (kebab-case) to their corresponding React components (PascalCase).

```tsx
import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("./heroSection/HeroSection"));
const CategoryGrid = dynamic(() => import("./categoryGrid/CategoryGrid"));

export const ecommerceRegistry = {
  "hero-section": HeroSection,
  "category-grid": CategoryGrid,
  "product-grid": ProductGrid,
  // ... other sections
};
```

---

## 5. Folder Structure

Strict isolation is mandatory to ensure the ecommerce system is modular and removable.

```
src/
├── app/[locale]/ecommerce/      # Route Entry (Proxy to Server Component)
│   └── page.tsx                 # Metadata & Data Fetching
├── components/ecommerce/        # Ecommerce UI Module
│   ├── DynamicRenderer.tsx      # Main content iterator
│   ├── ecommerceRegistry.tsx    # Section mapping registry
│   ├── EcommercePageServer.tsx  # Main server-side page wrapper
│   ├── heroSection/             # Section: Hero
│   ├── categoryGrid/            # Section: Category Navigation
│   ├── productGrid/             # Section: Product Engine
│   └── ...
├── data/ecommerce/              # Ecommerce JSON Data
│   └── ecommerce.json           # Master layout & content
└── lib/                         # Shared utilities (getV, etc.)
```

---

## 6. Routing System

Ecommerce routes are localized by default:
- English: `/en/ecommerce`
- Hindi: `/hi/ecommerce`

The `page.tsx` file handles the `[locale]` segment and passes the detected language to the page component.

---

## 7. JSON Schema Rules

Every section entry in the `ecommerce.json` must follow this structure:

```json
{
  "id": "unique_section_id",
  "type": "section-type-identifier",
  "layout": "default",
  "props": {
    "badge": { "type": "text", "value": { "en": "New", "hi": "नया" } },
    "title": { "type": "text", "value": { "en": "Title", "hi": "शीर्षक" } }
  },
  "content": []
}
```

---

## 8. Allowed Field Types (Whitelisted)

| `type` | Purpose | `value` Shape | Localized? |
| :--- | :--- | :--- | :--- |
| `text` | Single line string | `{ "en": "...", "hi": "..." }` | Yes |
| `textarea` | Paragraph text | `{ "en": "...", "hi": "..." }` | Yes |
| `image` | Cloudinary/Media URL | `"https://..."` | No |
| `link` | Internal/External path | `"/shop"` or `"https://..."` | No |
| `number` | Numeric values | `1299` | No |
| `list` | Arrays of objects | `[{ "en": "...", "hi": "..." }]` | Items: Yes |

---

## 9. Full `globals.css` Documentation

The `globals.css` is the ONLY source of truth for colors and typography.

### 9.1 Design Tokens (Variables)
```css
:root {
  --primary: oklch(0.205 0 0);    /* Onyx Black */
  --secondary: #98c45f;           /* Nest Green */
  --surface: #ffffff;
  --background: oklch(1 0 0);
  --border: oklch(0.922 0 0);
  --radius-lg: 18px;
  --shadow-md: 0 16px 40px rgba(0, 0, 0, 0.1);
}
```

### 9.2 Custom Component Classes
- `.product-card`: Bordered container with `hover:-translate-y-2`.
- `.card-body`: Glassmorphism overlay (`backdrop-blur-md`) inside cards.
- `.pill`: Rounded pill for categories or statuses.
- `.badge`: Small floating labels for "Sale" or "New".

---

## 10. Typography System

- **Heading Font**: `Cormorant Garamond` (Editorial, Elegant).
- **Body Font**: `Inter` (Functional, Clean).
- **Scaling**:
  - `Hero Title`: `text-5xl md:text-[76px]` with `leading-[0.95]`.
  - `Section Title`: `text-4xl lg:text-[56px]`.
  - `Body Text`: `text-lg` with `leading-relaxed`.

---

## 11. Color System

- **Primary**: Deep blacks and charcoal for premium feel.
- **Secondary**: NestCraft Green used for accents, buttons, and badges.
- **Background**: High-key whites and subtle surfaces (`bg-surface`).
- **Gradients**: Subtle radial and linear overlays for image readability.

---

## 12. Layout Rules

- **Container**: Max width `1440px` with responsive padding `px-[5%]`.
- **Section Spacing**: Large vertical gutters (`py-24` or `py-32`) to maintain premium "breathing room".
- **Grids**: CSS Grid with variable spans (e.g., masonry items spanning 2 rows).

---

## 13. Component Standards

- **Isolation**: One folder per section.
- **Default Data**: Every component must have an accompanying `sectionData.ts` with fallbacks.
- **TypeScript**: Interfaces for all props and data shapes.
- **No Hardcoding**: ZERO business text in TSX.

---

## 14. Animation Rules (Framer Motion)

Animations must be subtle and professional:
- **Reveal**: Fade up (`y: 20`) with cubic-bezier easing `[0.22, 1, 0.36, 1]`.
- **Stagger**: Entrance animations must use `staggerChildren`.
- **Hover**: Smooth scaling (`scale: 1.05`) and shadow transitions (`duration: 0.3`).

---

## 15. Responsive System

- **Mobile**: Single column layouts, smaller typography, sticky bottom CTA placeholders.
- **Tablet**: 2-column grids for products and categories.
- **Desktop**: Full editorial layouts, 3 or 4-column grids, floating glass cards.

---

## 16. Ecommerce Product System

Products are treated as dynamic entities in the `product-grid`.

### 16.1 Product Schema
```ts
interface Product {
  id: string;
  title: LocalizedString;
  price: number;
  oldPrice?: number;
  rating: number;
  tags: LocalizedString[];
  image: string;
  category: string;
}
```

---

## 17. Product Card Architecture

Premium design utilizing:
- **Image Wrapper**: Fixed aspect ratio with hover zoom.
- **Floating Badge**: Positioned top-left for status.
- **Glassmorphism Body**: Floating overlay with title and price.
- **Action Layer**: View Details + Add to Cart (ShoppingBag icon).

---

## 18. Category Grid System

A visual navigation system:
- **Editorial Grid**: Items spanning multiple rows/cols for visual interest.
- **Dynamic Count**: Localized count display (e.g., "124 Products").
- **Overlay**: Full image background with localized text at the bottom.

---

## 19. Filtering/Search/Sorting Logic

Implemented as local state in `ProductGrid.tsx`:
- **Search**: Case-insensitive substring match on titles.
- **Category Filter**: Strict equality check on product category.
- **Price Filter**: Range slider filtering on `product.price`.
- **Sorting**: Array manipulation based on `sortBy` key.

---

## 20. CTA Sections

- **Design**: High-impact background images with dark overlays.
- **Typography**: Large display headings.
- **Interaction**: Button hover effects and smooth entry transitions.

---

## 21. Newsletter System

- **Minimalist Design**: Simple form centered with localized copywriting.
- **Feedback Ready**: Placeholder for success/error handling.
- **Style**: Integrated into the page flow with `bg-surface`.

---

## 22. Testimonials System

- **Social Proof**: Clean cards with star ratings and localized quotes.
- **Aesthetic**: Minimal borders and soft shadows.
- **Layout**: 3-column grid on desktop.

---

## 23. FAQ System

- **Accordion Pattern**: Animated height transitions via Framer Motion.
- **Localized Q&A**: Every question and answer is multilingual.
- **Style**: Modern borders with background-active states.

---

## 24. Cloudinary Image Rules

- **Quality**: Always use `q=80` or `q=auto`.
- **Format**: Force `webp` or use `auto=format`.
- **Cropping**: Use `fit=crop` for product and category grids.

---

## 25. Developer Rules (STRICT)

- **Rule 1**: Every section must be reusable on any page.
- **Rule 2**: Props resolution must always use the `getV` utility.
- **Rule 3**: Any new section must be registered in `ecommerceRegistry.tsx`.
- **Rule 4**: Use Tailwind for layout and global classes for aesthetics.

---

## 26. Accessibility Standards

- **Semantic HTML**: Use `<section>`, `<h2>`, `<button>`, `<a>`.
- **Alt Text**: Every product/category image must have descriptive localized alt text.
- **Interactive**: Hover states must be accessible via keyboard.

---

## 27. AI Generation Workflow

1. **JSON First**: Define the page layout in `ecommerce.json`.
2. **Registry Mapping**: Map new types in `ecommerceRegistry.tsx`.
3. **Data Scaffold**: Create `sectionData.ts` with types and fallbacks.
4. **UI Build**: Construct the `.tsx` using global classes and `motion`.

---

## 28. Visual Quality Standards

- **Editorial Rhythm**: Generous whitespace.
- **Typography**: Contrast between Garamond (Heading) and Inter (Body).
- **Luxury Feel**: Use of glassmorphism and soft shadows.

---

## 29. Reusable Component Rules

Sections must not rely on parent state. They should be "dumb" components that receive data and render purely based on that data.

---

## 30. Dynamic Props Resolution

```ts
// Mandatory pattern in every component
const badge = getV(props.badge, lang);
const title = getV(props.title, lang);
```

---

## 31. Example Ecommerce JSON

```json
{
  "content": [
    {
      "id": "sec_hero",
      "type": "hero-section",
      "props": {
        "title": { "type": "text", "value": { "en": "Modern Home", "hi": "आधुनिक घर" } }
      }
    }
  ]
}
```

---

## 32. Example Product Schema

```json
{
  "id": "prod_1",
  "props": {
    "title": { "en": "Oak Table", "hi": "ओक टेबल" },
    "price": 1299,
    "image": "https://images.unsplash.com/..."
  }
}
```

---

## 33. Example Registry Mapping

```ts
export const ecommerceRegistry = {
  "hero-section": dynamic(() => import("./heroSection/HeroSection")),
  // ...
};
```

---

## 34. Example TSX Component Pattern

```tsx
const SectionName = ({ section }) => {
  const lang = useLocale(); // Shared hook or derived from pathname
  const props = section?.props || defaultData.props;
  // ... getV resolution
  return <section>...</section>;
}
```

---

## 35. Example globals.css Tokens

```css
.product-card { @apply border border-border bg-surface rounded-[20px] shadow-sm; }
```

---

## 36. Performance & Scalability Rules

- **Code Splitting**: All sections are lazy-loaded via `next/dynamic`.
- **Optimization**: Images use Cloudinary-ready URL parameters.
- **CSS**: Tailwind's JIT ensures only used styles are bundled.

---

## 37. Future Expansion Rules

To add a new section:
1. Create folder in `components/ecommerce/`.
2. Define `Component.tsx` and `componentData.ts`.
3. Add to `ecommerceRegistry.tsx`.
4. Update `ecommerce.json` to include the new type.

---
*Documentation Version: 1.0 — May 2026*
