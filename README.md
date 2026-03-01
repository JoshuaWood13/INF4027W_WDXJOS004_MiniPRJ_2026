# LaptopWRLD — Laptop E-Commerce Platform

**UCT Username:** WDXJOS004

## Deployed Site

🔗 **Deployment:** [https://laptopwrld.vercel.app/](https://laptopwrld.vercel.app/)

## Login Credentials

### Administrator Account

```
Email: admin@email.com
Password: Password123!
```

## Features

### Core E-Commerce Functionality

- Product browsing with filters (brand, price range, RAM, screen size, category)
- Shopping cart (persisted in browser for guests, synced on login)
- Checkout with simulated payment (EFT, Card, Cash on Delivery)
- User account with profile management, order history, and wishlist

### AI-Powered Features

- **AI Product Search** — Natural language queries (e.g. "MSI gaming laptop under R20k")
- **AI Image Search** — Upload a laptop image to find visually similar products
- **AI Product Summaries**  — AI generated product summaries highlighting key features and use cases

### Differentiating Features

- **Friend System** - Add friends via friend codes and view eachothers wishlists
- **Gifting System** — Purchase laptops and send them as gifts to other registered users
- **Auto-Buy Price Watcher** — Set a target price on wishlisted items. The product is then automatically purchased when the price drops below your target price. No more missing out on good deals!

### Admin Dashboard

- Full product CRUD (create, edit, delete laptops)
- Order management (view site-wide order history)
- Reports: Financial (revenue, profit margins, etc.), Product (best-sellers, most viewed, etc.), Customer (top buyers, repeat customers, etc.)

## Technologies Used

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **AI:** Google Gemini 2.5 Flash (via Firebase AI SDK)
- **State Management:** Redux Toolkit + Redux Persist
- **Styling:** Tailwind CSS + ShadCN UI
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Deployment:** Vercel

## How To Run Locally

### Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (included with Node.js)
- A **Firebase project** with Firestore and Authentication enabled

### Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd INF4027W_WDXJOS004_MiniPRJ_2026
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env.local`** in the project root with your Firebase credentials:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```

4. **Seed the database** (creates demo products and user accounts)

   ```bash
   npm run seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser

> **Note:** `.env.local` is git-ignored for security.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── auth/               # Login & Signup
│   ├── shop/               # Product listing + product detail
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow (auth required)
│   ├── order-confirmation/ # Post-purchase confirmation
│   ├── account/            # User profile, orders, wishlist, friends, addresses
│   ├── admin/              # Admin dashboard, products, orders, reports
│   └── api/                # API routes (image upload, price watchers)
├── components/             # Reusable UI components
│   ├── ui/                 # ShadCN UI primitives
│   ├── layout/             # Navbar, Footer
│   ├── homepage/           # Hero, Brands, Categories
│   ├── shop-page/          # Filters, sorting
│   ├── product-page/       # Product detail, specs, tabs
│   ├── checkout/           # Payment, gifting, order summary
│   ├── admin/              # Product form
│   └── common/             # Shared ProductCard, ProductListSec
├── lib/                    # Core logic
│   ├── firebase.ts         # Firebase client initialisation
│   ├── store.ts            # Redux store
│   ├── ai/                 # AI prompt templates
│   ├── auth/               # Auth context & helpers
│   ├── context/            # React contexts
│   ├── features/           # Redux slices (cart, filters)
│   ├── firestore/          # Firestore CRUD helpers
│   └── hooks/              # Custom React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global CSS & fonts
```

## Acknowledgements

This project is built on top of the **[Shopco](https://github.com/mohammadoftadeh/next-ecommerce-shopco)** open-source e-commerce template by **[Mohammad Oftadeh](https://github.com/mohammadoftadeh)**, licensed under the MIT License. The original template provided the foundational UI structure, which was extensively adapted for a laptop e-commerce use case with Firebase integration, AI features, and additional functionality.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
