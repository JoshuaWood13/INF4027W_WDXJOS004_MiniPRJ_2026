import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product.types";

const COLLECTION = "products";

// Helpers 

// Convert a firestore document snapshot to a typed Product */
function docToProduct(docSnap: any): Product {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as Product;
}

// Read

export type ProductFilters = {
  category?: string;
  brand?: string;
  maxPrice?: number;
  minPrice?: number;
  featured?: boolean;
  onSale?: boolean;
  limitCount?: number;
  sortBy?: "price-asc" | "price-desc" | "newest" | "sales";
};

// Get all products, optionally filtered.
export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  let products = snapshot.docs.map(docToProduct);

  // Apply all filters
  if (filters?.category) {
    products = products.filter((p) => p.category === filters.category);
  }
  if (filters?.brand) {
    products = products.filter((p) => p.brand === filters.brand);
  }
  if (filters?.featured !== undefined) {
    products = products.filter((p) => p.featured === filters.featured);
  }
  if (filters?.onSale !== undefined) {
    products = products.filter((p) => p.onSale === filters.onSale);
  }
  if (filters?.minPrice !== undefined) {
    products = products.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= filters.maxPrice!);
  }

  // Apply sorting
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "sales":
        products.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case "newest":
      default:
        break;
    }
  }

  // Apply limit after all filtering/sorting
  if (filters?.limitCount) {
    products = products.slice(0, filters.limitCount);
  }

  return products;
}

// Get a single product by ID 
export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToProduct(docSnap);
}

// Get multiple products by their IDs 
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const products: Product[] = [];

  // Fetch each product by ID 
  await Promise.all(
    ids.map(async (id) => {
      const product = await getProductById(id);
      if (product) products.push(product);
    }),
  );

  return products;
}

// Write

// Create a new product (admin)
export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

// Update an existing product (admin) 
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>,
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Delete a product (admin) 
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

// Counters

// Increment the view count for a product 
export async function incrementViewCount(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { viewCount: increment(1) });
}

// Increment the sales count for a product 
export async function incrementSalesCount(
  id: string,
  quantity: number = 1,
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { salesCount: increment(quantity) });
}
