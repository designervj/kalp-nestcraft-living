export interface Product {
  id: number | any;
  title: string;
  price: string;
  category: string;
  rating: number;
  reviews: number;
  badge: string;
  description: string;
  img: string;
  specs?: { label: string; value: string }[];
}

export const products: Product[] = [
  {
    id: "luxury-fabric-sofa",
    title: "Suede Lounge Chair",
    price: "₹45,000",
    category: "Living Room",
    rating: 5.0,
    reviews: 124,
    badge: "Bestseller",
    description:
      "Experience the perfect blend of form and function with our Suede Lounge Chair. Crafted with premium materials for lasting comfort and style.",
    img: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&q=80&w=1400",
    specs: [
      { label: "Dimensions", value: "80cm x 75cm x 85cm" },
      { label: "Material", value: "Solid Oak, Premium Suede" },
      { label: "Origin", value: "Handcrafted in India" },
    ],
  },
  {
    id: 2,
    title: "Archi 3-Seat Sofa",
    price: "₹1,20,000",
    category: "Living Room",
    rating: 4.9,
    reviews: 86,
    badge: "New",
    description:
      "A masterpiece of modern design, the Archi 3-Seat Sofa offers unparalleled comfort and sophisticated style.",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: 3,
    title: "Oak Coffee Table",
    price: "₹32,000",
    category: "Living Room",
    rating: 4.8,
    reviews: 52,
    badge: "Classic",
    description:
      "Solid oak construction with a minimalist aesthetic. This coffee table celebrates the raw beauty of natural timber.",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: 4,
    title: "Orbital Floor Lamp",
    price: "₹21,000",
    category: "Lighting",
    rating: 5.0,
    reviews: 45,
    badge: "Top Rated",
    description:
      "Illuminate your space with the Orbital Floor Lamp. Its unique design and warm glow create a cozy atmosphere.",
    img: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: 5,
    title: "Ceramic Totem Vase",
    price: "₹8,500",
    category: "Decor",
    rating: 4.7,
    reviews: 210,
    badge: "Limited",
    description:
      "A hand-thrown ceramic vase with a unique totem-inspired shape. A beautiful accent piece for your home decor.",
    img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: 6,
    title: "Brutalist Wood Stool",
    price: "₹18,000",
    category: "Living Room",
    rating: 4.9,
    reviews: 38,
    badge: "Essential",
    description:
      "Celebrate the raw beauty of natural timber with our Brutalist Wood Stool.",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1400",
  },
  {
    id: 7,
    title: "Velvet Platform Bed",
    price: "₹1,50,000",
    category: "Bedroom",
    rating: 4.9,
    reviews: 42,
    badge: "Premium",
    description:
      "Transform your bedroom into a sanctuary with our Velvet Platform Bed.",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 8,
    title: "Minimalist Desk",
    price: "₹32,000",
    category: "Home Office",
    rating: 4.4,
    reviews: 28,
    badge: "Essential",
    description:
      "A clean, functional desk designed for focus and productivity.",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200",
  },
];

export interface Category {
  id: string;
  name: string;
  description: string;
  img: string;
}

export const categories: Category[] = [
  {
    id: "living-room",
    name: "Living Room",
    description:
      "Curated seating, tables, and decor — built for everyday living.",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: "bedroom",
    name: "Bedroom",
    description:
      "Serene sleep essentials and textiles for your private sanctuary.",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: "dining-room",
    name: "Dining Room",
    description: "Tables and chairs designed for gathering and conversation.",
    img: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: "lighting",
    name: "Lighting",
    description: "Sculptural lamps and fixtures to illuminate your home.",
    img: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: "decor",
    name: "Decor",
    description: "Handcrafted accents and textiles to personalize your space.",
    img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: "home-office",
    name: "Home Office",
    description: "Functional furniture for a productive workspace.",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2000",
  },
];
