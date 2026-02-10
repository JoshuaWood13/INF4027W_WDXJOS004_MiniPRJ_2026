/**
 * Seed script: Populates Firestore with 25 laptop products.
 *
 * Usage:
 *   npx tsx scripts/seed-products.ts
 *
 * Prerequisites:
 *   1. Fill in your Firebase config in .env.local
 *   2. npm install tsx (dev dependency) — or use npx
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type SeedProductBase = {
  name: string;
  brand: string;
  price: number;
  cost: number;
  category: string;
  specs: {
    processor: string;
    ram: string;
    storage: string;
    gpu: string;
    screenSize: string;
    display: string;
    os: string;
    weight: string;
  };
  images: string[];
  tags: string[];
  description: string;
  discount: { amount: number; percentage: number };
  rating: number;
  featured?: boolean; // override; defaults to false
};

const products: SeedProductBase[] = [
  // ===== GAMING (5) =====
  {
    name: "ASUS ROG Strix G16",
    brand: "ASUS",
    price: 32999,
    cost: 22000,
    category: "gaming",
    specs: {
      processor: "Intel Core i7-13650HX",
      ram: "16GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA RTX 4060 8GB",
      screenSize: '16"',
      display: "1920x1200 IPS 165Hz",
      os: "Windows 11 Home",
      weight: "2.5 kg",
    },
    images: ["/images/laptops/asus-rog-strix-g16.png"],
    tags: ["gaming", "rgb", "high-refresh", "nvidia"],
    description:
      "A powerful gaming laptop featuring an Intel i7 processor and RTX 4060 GPU, designed for smooth gameplay at high settings.",
    discount: { amount: 0, percentage: 10 },
    rating: 4.6,
    featured: true,
  },
  {
    name: "Lenovo Legion 5 Pro",
    brand: "Lenovo",
    price: 28499,
    cost: 19000,
    category: "gaming",
    specs: {
      processor: "AMD Ryzen 7 7745HX",
      ram: "16GB DDR5",
      storage: "512GB NVMe SSD",
      gpu: "NVIDIA RTX 4060 8GB",
      screenSize: '16"',
      display: "2560x1600 IPS 165Hz",
      os: "Windows 11 Home",
      weight: "2.5 kg",
    },
    images: ["/images/laptops/lenovo-legion-5-pro.png"],
    tags: ["gaming", "QHD", "ryzen", "nvidia"],
    description:
      "A high-performance gaming laptop with a stunning QHD display and powerful AMD Ryzen processor for competitive and AAA gaming.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.5,
  },
  {
    name: "MSI Katana 15",
    brand: "MSI",
    price: 19999,
    cost: 13500,
    category: "gaming",
    specs: {
      processor: "Intel Core i5-12450H",
      ram: "8GB DDR5",
      storage: "512GB NVMe SSD",
      gpu: "NVIDIA RTX 4050 6GB",
      screenSize: '15.6"',
      display: "1920x1080 IPS 144Hz",
      os: "Windows 11 Home",
      weight: "2.25 kg",
    },
    images: ["/images/laptops/msi-katana-15.png"],
    tags: ["gaming", "budget", "nvidia", "entry-level"],
    description:
      "An affordable entry into gaming with RTX 4050 graphics and a 144Hz display, ideal for esports and lighter titles.",
    discount: { amount: 0, percentage: 15 },
    rating: 4.0,
  },
  {
    name: "HP Omen 16",
    brand: "HP",
    price: 35999,
    cost: 24500,
    category: "gaming",
    specs: {
      processor: "Intel Core i7-13700HX",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA RTX 4070 8GB",
      screenSize: '16.1"',
      display: "2560x1440 IPS 165Hz",
      os: "Windows 11 Home",
      weight: "2.37 kg",
    },
    images: ["/images/laptops/hp-omen-16.png"],
    tags: ["gaming", "premium", "QHD", "nvidia"],
    description:
      "Premium gaming experience with RTX 4070 and QHD 165Hz display. Built for serious gamers who want no compromise.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.7,
  },
  {
    name: "Acer Nitro V 15",
    brand: "Acer",
    price: 16499,
    cost: 11000,
    category: "gaming",
    specs: {
      processor: "AMD Ryzen 5 7535HS",
      ram: "8GB DDR5",
      storage: "512GB NVMe SSD",
      gpu: "NVIDIA RTX 4050 6GB",
      screenSize: '15.6"',
      display: "1920x1080 IPS 144Hz",
      os: "Windows 11 Home",
      weight: "2.1 kg",
    },
    images: ["/images/laptops/acer-nitro-v-15.png"],
    tags: ["gaming", "budget", "nvidia", "amd"],
    description:
      "Budget-friendly gaming with RTX 4050 and a fast display. Perfect for students who game on the side.",
    discount: { amount: 1000, percentage: 0 },
    rating: 3.9,
  },

  // ===== BUSINESS (5) =====
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    brand: "Lenovo",
    price: 34999,
    cost: 24000,
    category: "business",
    specs: {
      processor: "Intel Core i7-1365U",
      ram: "16GB LPDDR5",
      storage: "512GB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '14"',
      display: "2560x1600 IPS 400 nits",
      os: "Windows 11 Pro",
      weight: "1.12 kg",
    },
    images: ["/images/laptops/lenovo-thinkpad-x1-carbon.png"],
    tags: ["business", "lightweight", "thinkpad", "professional"],
    description:
      "The gold standard for business laptops. Ultra-light carbon fiber build, legendary ThinkPad keyboard, and all-day battery.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.8,
    featured: true,
  },
  {
    name: "Dell Latitude 7440",
    brand: "Dell",
    price: 27999,
    cost: 18500,
    category: "business",
    specs: {
      processor: "Intel Core i7-1365U",
      ram: "16GB LPDDR5",
      storage: "512GB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '14"',
      display: "1920x1200 IPS",
      os: "Windows 11 Pro",
      weight: "1.37 kg",
    },
    images: ["/images/laptops/dell-latitude-7440.png"],
    tags: ["business", "enterprise", "dell", "professional"],
    description:
      "Enterprise-grade business laptop with robust security features, excellent keyboard, and manageable fleet deployment.",
    discount: { amount: 0, percentage: 10 },
    rating: 4.4,
  },
  {
    name: "HP EliteBook 840 G10",
    brand: "HP",
    price: 29499,
    cost: 20000,
    category: "business",
    specs: {
      processor: "Intel Core i7-1365U",
      ram: "16GB DDR5",
      storage: "512GB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '14"',
      display: "1920x1200 IPS 400 nits",
      os: "Windows 11 Pro",
      weight: "1.36 kg",
    },
    images: ["/images/laptops/hp-elitebook-840.png"],
    tags: ["business", "enterprise", "hp", "secure"],
    description:
      "A premium business notebook with MIL-STD durability, HP Wolf Security, and a bright outdoor-readable display.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.5,
  },
  {
    name: "Lenovo ThinkPad T14s Gen 4",
    brand: "Lenovo",
    price: 24999,
    cost: 16500,
    category: "business",
    specs: {
      processor: "AMD Ryzen 7 PRO 7840U",
      ram: "16GB LPDDR5",
      storage: "512GB NVMe SSD",
      gpu: "AMD Radeon 780M",
      screenSize: '14"',
      display: "1920x1200 IPS",
      os: "Windows 11 Pro",
      weight: "1.22 kg",
    },
    images: ["/images/laptops/lenovo-thinkpad-t14s.png"],
    tags: ["business", "amd", "thinkpad", "lightweight"],
    description:
      "Business performance meets AMD efficiency. Great battery life and the trusted ThinkPad build quality at a competitive price.",
    discount: { amount: 2000, percentage: 0 },
    rating: 4.3,
  },
  {
    name: "Dell Vostro 3520",
    brand: "Dell",
    price: 12999,
    cost: 8500,
    category: "business",
    specs: {
      processor: "Intel Core i5-1235U",
      ram: "8GB DDR4",
      storage: "256GB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '15.6"',
      display: "1920x1080 IPS",
      os: "Windows 11 Pro",
      weight: "1.66 kg",
    },
    images: ["/images/laptops/dell-vostro-3520.png"],
    tags: ["business", "budget", "dell", "small-business"],
    description:
      "Reliable and affordable business laptop for small businesses and startups. Comes with Windows Pro for domain management.",
    discount: { amount: 0, percentage: 0 },
    rating: 3.8,
  },

  // ===== ULTRABOOK (5) =====
  {
    name: "Apple MacBook Air M3",
    brand: "Apple",
    price: 22999,
    cost: 17000,
    category: "ultrabook",
    specs: {
      processor: "Apple M3 8-core",
      ram: "8GB Unified",
      storage: "256GB SSD",
      gpu: "Apple M3 10-core GPU",
      screenSize: '13.6"',
      display: "2560x1664 Liquid Retina",
      os: "macOS Sonoma",
      weight: "1.24 kg",
    },
    images: ["/images/laptops/macbook-air-m3.png"],
    tags: ["ultrabook", "apple", "lightweight", "fanless"],
    description:
      "The fanless MacBook Air with M3 chip delivers incredible performance in a thin, light design with an all-day battery.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.9,
    featured: true,
  },
  {
    name: "Dell XPS 13 Plus",
    brand: "Dell",
    price: 29999,
    cost: 20000,
    category: "ultrabook",
    specs: {
      processor: "Intel Core i7-1360P",
      ram: "16GB LPDDR5",
      storage: "512GB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '13.4"',
      display: "1920x1200 OLED Touch",
      os: "Windows 11 Home",
      weight: "1.23 kg",
    },
    images: ["/images/laptops/dell-xps-13-plus.png"],
    tags: ["ultrabook", "oled", "premium", "touch"],
    description:
      "A stunning ultrabook with an edge-to-edge OLED touchscreen, invisible trackpad, and premium CNC aluminum build.",
    discount: { amount: 0, percentage: 15 },
    rating: 4.5,
  },
  {
    name: "ASUS ZenBook 14 OLED",
    brand: "ASUS",
    price: 19999,
    cost: 13500,
    category: "ultrabook",
    specs: {
      processor: "AMD Ryzen 7 7840U",
      ram: "16GB LPDDR5",
      storage: "512GB NVMe SSD",
      gpu: "AMD Radeon 780M",
      screenSize: '14"',
      display: "2880x1800 OLED 90Hz",
      os: "Windows 11 Home",
      weight: "1.2 kg",
    },
    images: ["/images/laptops/asus-zenbook-14-oled.png"],
    tags: ["ultrabook", "oled", "lightweight", "amd"],
    description:
      "A gorgeous 2.8K OLED display in a compact, lightweight body. Exceptional color accuracy for creatives and everyday users alike.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.6,
  },
  {
    name: "Apple MacBook Pro 14 M3 Pro",
    brand: "Apple",
    price: 42999,
    cost: 33000,
    category: "ultrabook",
    specs: {
      processor: "Apple M3 Pro 12-core",
      ram: "18GB Unified",
      storage: "512GB SSD",
      gpu: "Apple M3 Pro 18-core GPU",
      screenSize: '14.2"',
      display: "3024x1964 Liquid Retina XDR",
      os: "macOS Sonoma",
      weight: "1.61 kg",
    },
    images: ["/images/laptops/macbook-pro-14-m3.png"],
    tags: ["ultrabook", "apple", "professional", "creative"],
    description:
      "Pro-level performance for developers, designers, and video editors. The M3 Pro chip handles demanding creative workloads with ease.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.9,
    featured: true,
  },
  {
    name: "HP Spectre x360 14",
    brand: "HP",
    price: 31999,
    cost: 21500,
    category: "ultrabook",
    specs: {
      processor: "Intel Core i7-1355U",
      ram: "16GB LPDDR5",
      storage: "1TB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '14"',
      display: "2880x1800 OLED Touch",
      os: "Windows 11 Home",
      weight: "1.39 kg",
    },
    images: ["/images/laptops/hp-spectre-x360-14.png"],
    tags: ["ultrabook", "2-in-1", "oled", "touch", "convertible"],
    description:
      "A premium 2-in-1 convertible with a stunning OLED touch display, gem-cut design, and versatile tent/tablet modes.",
    discount: { amount: 3000, percentage: 0 },
    rating: 4.4,
  },

  // ===== STUDENT (5) =====
  {
    name: "Acer Aspire 3 15",
    brand: "Acer",
    price: 8999,
    cost: 5800,
    category: "student",
    specs: {
      processor: "AMD Ryzen 5 7520U",
      ram: "8GB DDR5",
      storage: "256GB NVMe SSD",
      gpu: "AMD Radeon 610M",
      screenSize: '15.6"',
      display: "1920x1080 IPS",
      os: "Windows 11 Home",
      weight: "1.78 kg",
    },
    images: ["/images/laptops/acer-aspire-3-15.png"],
    tags: ["student", "budget", "affordable", "everyday"],
    description:
      "A reliable everyday laptop for students on a budget. Handles web browsing, documents, and light media with ease.",
    discount: { amount: 0, percentage: 0 },
    rating: 3.8,
  },
  {
    name: "Lenovo IdeaPad Slim 3",
    brand: "Lenovo",
    price: 9999,
    cost: 6500,
    category: "student",
    specs: {
      processor: "Intel Core i5-1335U",
      ram: "8GB DDR4",
      storage: "512GB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '15.6"',
      display: "1920x1080 IPS",
      os: "Windows 11 Home",
      weight: "1.62 kg",
    },
    images: ["/images/laptops/lenovo-ideapad-slim-3.png"],
    tags: ["student", "budget", "lenovo", "everyday"],
    description:
      "Great value for students with a spacious 512GB SSD, comfortable keyboard, and decent battery life for long lecture days.",
    discount: { amount: 0, percentage: 10 },
    rating: 4.0,
  },
  {
    name: "HP 15s",
    brand: "HP",
    price: 7999,
    cost: 5200,
    category: "student",
    specs: {
      processor: "Intel Core i3-1215U",
      ram: "8GB DDR4",
      storage: "256GB NVMe SSD",
      gpu: "Intel UHD Graphics",
      screenSize: '15.6"',
      display: "1920x1080 SVA",
      os: "Windows 11 Home S",
      weight: "1.69 kg",
    },
    images: ["/images/laptops/hp-15s.png"],
    tags: ["student", "budget", "hp", "entry-level"],
    description:
      "The most affordable option for basic student needs. Perfect for note-taking, email, and web-based coursework.",
    discount: { amount: 0, percentage: 0 },
    rating: 3.5,
  },
  {
    name: "ASUS VivoBook 15",
    brand: "ASUS",
    price: 10999,
    cost: 7200,
    category: "student",
    featured: true,
    specs: {
      processor: "AMD Ryzen 5 7530U",
      ram: "8GB DDR4",
      storage: "512GB NVMe SSD",
      gpu: "AMD Radeon Graphics",
      screenSize: '15.6"',
      display: "1920x1080 IPS",
      os: "Windows 11 Home",
      weight: "1.7 kg",
    },
    images: ["/images/laptops/asus-vivobook-15.png"],
    tags: ["student", "everyday", "asus", "colorful"],
    description:
      "Stylish and capable student laptop with an ergonomic hinge, fast SSD, and a lightweight design for campus life.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.1,
  },
  {
    name: "Dell Inspiron 15 3530",
    brand: "Dell",
    price: 11499,
    cost: 7500,
    category: "student",
    specs: {
      processor: "Intel Core i5-1335U",
      ram: "8GB DDR4",
      storage: "512GB NVMe SSD",
      gpu: "Intel Iris Xe",
      screenSize: '15.6"',
      display: "1920x1080 IPS",
      os: "Windows 11 Home",
      weight: "1.65 kg",
    },
    images: ["/images/laptops/dell-inspiron-15.png"],
    tags: ["student", "dell", "reliable", "mainstream"],
    description:
      "A well-rounded student laptop from Dell with a comfortable keyboard, good display, and solid build quality.",
    discount: { amount: 0, percentage: 5 },
    rating: 4.0,
  },

  // ===== WORKSTATION (5) =====
  {
    name: "Dell Precision 5680",
    brand: "Dell",
    price: 59999,
    cost: 42000,
    category: "workstation",
    featured: true,
    specs: {
      processor: "Intel Core i9-13900H",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA RTX 3500 Ada 12GB",
      screenSize: '16"',
      display: "3840x2400 OLED Touch",
      os: "Windows 11 Pro",
      weight: "1.91 kg",
    },
    images: ["/images/laptops/dell-precision-5680.png"],
    tags: ["workstation", "professional", "CAD", "4K", "oled"],
    description:
      "A mobile workstation for engineers and 3D professionals. ISV-certified for AutoCAD, SolidWorks, and other pro apps.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.7,
  },
  {
    name: "Lenovo ThinkPad P16s Gen 2",
    brand: "Lenovo",
    price: 38999,
    cost: 26500,
    category: "workstation",
    specs: {
      processor: "Intel Core i7-1360P",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA RTX A500 4GB",
      screenSize: '16"',
      display: "2560x1600 IPS",
      os: "Windows 11 Pro",
      weight: "1.73 kg",
    },
    images: ["/images/laptops/lenovo-thinkpad-p16s.png"],
    tags: ["workstation", "thinkpad", "ISV-certified", "engineering"],
    description:
      "A lighter mobile workstation with professional NVIDIA graphics, ISV certification, and classic ThinkPad reliability.",
    discount: { amount: 0, percentage: 10 },
    rating: 4.4,
  },
  {
    name: "HP ZBook Fury 16 G10",
    brand: "HP",
    price: 64999,
    cost: 45000,
    category: "workstation",
    specs: {
      processor: "Intel Core i9-13950HX",
      ram: "64GB DDR5",
      storage: "2TB NVMe SSD",
      gpu: "NVIDIA RTX 5000 Ada 16GB",
      screenSize: '16"',
      display: "3840x2400 IPS DreamColor",
      os: "Windows 11 Pro",
      weight: "2.85 kg",
    },
    images: ["/images/laptops/hp-zbook-fury-16.png"],
    tags: ["workstation", "premium", "64GB", "4K", "creative"],
    description:
      "The ultimate mobile workstation. 64GB RAM, 4K DreamColor display, and top-tier NVIDIA Ada GPU for the most demanding workloads.",
    discount: { amount: 5000, percentage: 0 },
    rating: 4.8,
  },
  {
    name: "Apple MacBook Pro 16 M3 Max",
    brand: "Apple",
    price: 74999,
    cost: 58000,
    category: "workstation",
    featured: true,
    specs: {
      processor: "Apple M3 Max 16-core",
      ram: "48GB Unified",
      storage: "1TB SSD",
      gpu: "Apple M3 Max 40-core GPU",
      screenSize: '16.2"',
      display: "3456x2234 Liquid Retina XDR",
      os: "macOS Sonoma",
      weight: "2.14 kg",
    },
    images: ["/images/laptops/macbook-pro-16-m3-max.png"],
    tags: ["workstation", "apple", "creative", "video-editing", "premium"],
    description:
      "The most powerful MacBook ever. M3 Max drives 8K video editing, 3D rendering, and massive datasets without breaking a sweat.",
    discount: { amount: 0, percentage: 0 },
    rating: 4.9,
  },
  {
    name: "ASUS ProArt StudioBook 16 OLED",
    brand: "ASUS",
    price: 49999,
    cost: 35000,
    category: "workstation",
    specs: {
      processor: "Intel Core i9-13980HX",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA RTX 4070 8GB",
      screenSize: '16"',
      display: "3840x2400 OLED",
      os: "Windows 11 Pro",
      weight: "2.4 kg",
    },
    images: ["/images/laptops/asus-proart-studiobook-16.png"],
    tags: ["workstation", "creative", "oled", "4K", "color-accurate"],
    description:
      "Built for creative professionals with a Pantone-validated 4K OLED display and powerful specs for video editing and design.",
    discount: { amount: 0, percentage: 5 },
    rating: 4.6,
  },
];

async function seed() {
  console.log("Starting product seed...\n");

  const col = collection(db, "products");

  for (const product of products) {
    // Derive computed fields
    const onSale = product.discount.amount > 0 || product.discount.percentage > 0;
    const featured = product.featured ?? false;

    try {
      const docRef = await addDoc(col, {
        ...product,
        featured,
        onSale,
        viewCount: 0,
        salesCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  Added: ${product.name} (${docRef.id})${featured ? " [FEATURED]" : ""}${onSale ? " [ON SALE]" : ""}`);
    } catch (error) {
      console.error(`  FAILED: ${product.name}`, error);
    }
  }

  console.log(`\nDone! Seeded ${products.length} products.`);
  process.exit(0);
}

seed();
