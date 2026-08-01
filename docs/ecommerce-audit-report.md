# NestCraft Living — E-Commerce Audit Report

> **Date:** July 13, 2026
> **Project:** NestCraft Living (Next.js + MongoDB + Razorpay)
> **Purpose:** Detailed audit of existing e-commerce features, missing capabilities, and prioritized roadmap.

---

## Table of Contents

1. [Existing Features (What's Working)](#1-existing-features-whats-working)
2. [Missing / Incomplete Features](#2-missing--incomplete-features)
3. [Technical Improvements](#3-technical-improvements)
4. [Feature Roadmap (Priority Order)](#4-feature-roadmap-priority-order)
5. [How We Will Work](#5-how-we-will-work)

---

## 1. Existing Features (What's Working)

### 1.1 Customer Storefront

| Feature | Status | Location / Details |
|---------|--------|--------------------|
| 🏠 **Home Page** | ✅ Complete | Product slider, hero sections, USP banners |
| 📦 **Product Detail Page** | ✅ Complete | Variant selection, image gallery, pricing, add-to-cart, wishlist toggle |
| 🗂️ **Category / Listing Page** | ✅ Complete | Filters (sidebar), sorting, pagination, product grid |
| 🛒 **Shopping Cart** | ✅ Complete | Quantity management, remove items, order summary |
| 💳 **Checkout (3-Step)** | ✅ Complete | Shipping → Payment → Review. Supports COD + Razorpay |
| 🎫 **Coupon Codes** | ⚠️ Partial | Only 2 hardcoded codes (`WELCOME10`, `NEST50`) — **not DB-driven** |
| ❤️ **Wishlist** | ✅ Complete | Add/remove products, persisted to user profile |
| 📋 **Order History** | ✅ Complete | `/orders` — list of past orders |
| 📄 **Order Detail** | ✅ Complete | `/orders/[id]` — line items, pricing, status |
| 🔐 **Login / Signup** | ✅ Complete | `/login`, `/signup` — JWT-based auth |
| 👤 **Account Page** | ✅ Complete | Profile, saved addresses |
| 📝 **About Page** | ✅ Present | `/about` |
| 📞 **Contact Page** | ✅ Present | `/contact` |
| ✍️ **Blog Page** | ✅ Present | `/blog` |
| ❓ **FAQ Page** | ✅ Present | `/faq` |
| 🛠️ **Services Page** | ✅ Present | `/services` |
| 🔍 **SEO Metadata** | ✅ Present | Per-page `metaTitle`, `metaDescription` |
| 📊 **Analytics** | ✅ Present | Google Analytics + Meta Pixel (configurable via CMS) |
| 🌐 **Localization** | ✅ Architecture | i18n-ready (`[locale]` routing) |

### 1.2 Admin Dashboard

| Feature | Status | Details |
|---------|--------|---------|
| **Products** (CRUD) | ✅ Complete | Product forms, gallery, variants, pricing, stock |
| **Categories** (CRUD) | ✅ Complete | Hierarchical, multi-type (product/portfolio/blog) |
| **Orders** | ✅ Complete | View, filter by status, payment status, fulfillment |
| **Users** | ✅ Complete | Customer & admin user management |
| **Variants** | ✅ Complete | Variant matrix with stock tracking per variant |
| **Attributes** | ✅ Complete | Product specs / attribute sets |
| **Media Library** | ✅ Complete | Upload, manage, ALT text for SEO |
| **Pages (CMS)** | ✅ Complete | Page editor with SEO fields |
| **Branding** | ✅ Complete | Logos, colors, social media, locations |
| **Theme** | ✅ Complete | Theme customization |
| **Forms** | ✅ Complete | Custom form builder |
| **Form Submissions** | ✅ Complete | View submitted form data |
| **Account Settings** | ✅ Complete | Admin profile settings |
| **Sync** | ✅ Present | Inventory / data sync tool |

### 1.3 Backend / API

| API | Status | Details |
|-----|--------|---------|
| Products API | ✅ Full CRUD | Search, category filter, aggregation with variants |
| Categories API | ✅ Full CRUD | Including bulk create |
| Cart API | ✅ Full CRUD | Session-based + user cart merge logic |
| Orders API | ✅ Full CRUD | Order creation, payment verification |
| Auth API | ✅ Complete | Login, signup, logout, session management |
| Payment Gateway | ✅ Extensible | Razorpay integrated; abstract base class for new gateways |
| Comments API | ✅ Present | Page-level comments |
| Upload API | ✅ Present | File upload to Cloudinary |
| Multi-Tenancy | ✅ Present | Tenant-aware MongoDB routing |

### 1.4 Technical Highlights

- ✅ **Redux Toolkit** state management (cart, auth, products, orders, etc.)
- ✅ **JWT-based authentication** with role-based access (customer / tenant_admin)
- ✅ **Razorpay payment integration** with abstract gateway pattern
- ✅ **Coupon code support** (basic — client-side only, hardcoded)
- ✅ **Variant architecture** with stock tracking, SKU, pricing
- ✅ **Shipping zones & tax rules** configurable via CMS
- ✅ **Saved addresses** for logged-in users
- ✅ **Wishlist** synced to user profile
- ✅ **Framer Motion** animations throughout
- ✅ **Responsive design** (Tailwind CSS)
- ✅ **MongoDB** with Mongoose-like patterns

---

## 2. Missing / Incomplete Features

### 2.1 Critical Gaps (High Priority)

| # | Feature | Impact | Current State |
|---|---------|--------|---------------|
| **1** | 🔍 **Global Product Search** | 🔴 High | No search bar in header. Only category-level search exists. |
| **2** | ⭐ **Product Reviews & Ratings** | 🔴 High | No review/rating system — missing social proof, hurts conversion |
| **3** | 📧 **Transactional Emails** | 🔴 High | No order confirmation, shipping notification, or password reset emails |
| **4** | 🔄 **Returns & Refunds** | 🔴 High | No return/refund workflow for customers or admins |
| **5** | 🎯 **Discount Engine (Admin Panel)** | 🔴 High | Coupons are hardcoded — no DB-backed coupon system with admin management |

### 2.2 Medium Priority

| # | Feature | Current State |
|---|---------|---------------|
| **6** | 📦 **Order Tracking** | No real-time tracking or status updates page for customers |
| **7** | ⚖️ **Multi-Currency** | Only INR supported; no currency switching |
| **8** | 👀 **Quick View Modal** | No quick-view modal on category/product listing pages |
| **9** | 🍞 **Breadcrumbs on Product Pages** | Breadcrumb code is **commented out** — needs to be fixed |
| **10** | 📋 **Size Guide / Specs Sheet** | No dedicated technical specs display on product detail page |

### 2.3 Nice-to-Have

| # | Feature | Notes |
|---|---------|-------|
| 11 | **Recently Viewed Products** | Helps retargeting and improves UX |
| 12 | **Product Comparison** | Compare 2-4 products side-by-side |
| 13 | **Gift Wrapping / Gift Message** | Upsell opportunity at checkout |
| 14 | **Newsletter Signup** | Mentioned in CMS blueprint but not on storefront |
| 15 | **Wishlist Sharing** | Share wishlists via link or social media |
| 16 | **Bulk Product Import/Export** | API route is commented out / incomplete |
| 17 | **Inventory Alerts (Admin)** | Low-stock notifications |
| 18 | **Rich Dashboard Analytics** | Admin dashboard charts could be richer (revenue, orders, trends) |
| 19 | **Guest Checkout** | Config exists in CMS but flow needs verification |

---

## 3. Technical Improvements

| # | Issue | Recommendation |
|---|-------|---------------|
| **T1** | Coupon codes hardcoded in `CheckoutPage.tsx` | Build DB-backed coupon system with admin CRUD |
| **T2** | `ChunkErrorRecovery` component commented out | Uncomment to catch runtime errors gracefully |
| **T3** | No Cloudinary URL transformations | Apply `q_auto`, `f_webp`, `w_*` params for performance |
| **T4** | Inconsistent loading/skeleton states | Add proper skeletons to pages missing them |
| **T5** | Breadcrumb code commented out in product detail | Restore and fix category-path breadcrumbs |
| **T6** | Bulk import API is commented out | Complete the bulk product import/export flow |
| **T7** | No TypeScript strict mode evident | Consider enabling stricter type checking |

---

## 4. Feature Roadmap (Priority Order)

We will implement features **one at a time**, in the following order:

### Phase 1 — Core Commerce Essentials

| Step | Feature | Est. Effort | Why First |
|------|---------|-------------|-----------|
| **1** | 🔍 **Global Product Search** | Medium | Users can't find products — fundamental UX gap |
| **2** | ⭐ **Product Reviews & Ratings** | Large | Social proof drives conversion for furniture |
| **3** | 📧 **Transactional Emails** | Medium | Customers get zero order confirmation |

### Phase 2 — Operations & Retention

| Step | Feature | Est. Effort | Why Second |
|------|---------|-------------|------------|
| **4** | 🎯 **Discount Engine (Admin Panel)** | Medium | Replace hardcoded coupons with proper system |
| **5** | 🔄 **Returns & Refunds** | Large | Required for customer trust and operations |
| **6** | 📦 **Order Tracking** | Medium | Customers want to know where their order is |

### Phase 3 — UX Polish & Growth

| Step | Feature | Est. Effort | Why Third |
|------|---------|-------------|-----------|
| **7** | 👀 **Quick View Modal** | Small | Faster browsing on listing pages |
| **8** | 🍞 **Product Breadcrumbs** | Small | Fix commented-out code |
| **9** | 🕐 **Recently Viewed Products** | Medium | Retargeting & improved UX |
| **10** | ⚖️ **Multi-Currency** | Medium | Expand beyond INR |

### Phase 4 — Admin & Technical

| Step | Feature | Est. Effort |
|------|---------|-------------|
| **11** | Bulk Product Import/Export | Medium |
| **12** | Inventory Alerts (Admin) | Small |
| **13** | Gift Wrapping at Checkout | Small |
| **14** | Newsletter Signup on Storefront | Small |
| **15** | Wishlist Sharing | Small |
| **16** | Improve Dashboard Analytics | Medium |
| **17** | Cloudinary Image Optimization | Small |
| **18** | Enable ChunkErrorRecovery | Small |

---

## 5. How We Will Work

Each feature will follow this workflow:

1. **We discuss** the feature and any design/implementation decisions
2. **I implement** the feature in the codebase
3. **You review** the changes
4. **We test** together
5. **Move to next feature**

### Starting Point

We start with **Step 1: Global Product Search**.

Ready when you are! 🚀
