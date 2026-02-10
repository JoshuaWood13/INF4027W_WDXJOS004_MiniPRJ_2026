import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser, PriceWatcher, UserRole } from "@/types/user.types";

const COLLECTION = "users";

/** Convert a Firestore document to a typed AppUser */
function docToUser(docSnap: any): AppUser {
  const data = docSnap.data();
  return {
    ...data,
    uid: docSnap.id,
    wishlist: data.wishlist ?? [],
    priceWatchers: data.priceWatchers ?? [],
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as AppUser;
}

// ---------- Read ----------

/** Get a user by UID */
export async function getUserByUid(uid: string): Promise<AppUser | null> {
  const docRef = doc(db, COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToUser(docSnap);
}

// ---------- Write ----------

/** Create a new user document (called on signup) */
export async function createUser(data: {
  uid: string;
  email: string;
  displayName: string;
  role?: UserRole;
}): Promise<void> {
  await setDoc(doc(db, COLLECTION, data.uid), {
    email: data.email,
    displayName: data.displayName,
    role: data.role ?? "customer",
    wishlist: [],
    priceWatchers: [],
    createdAt: Timestamp.now(),
  });
}

/** Update user profile fields */
export async function updateUser(
  uid: string,
  data: Partial<Omit<AppUser, "uid" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { ...data });
}

// ---------- Wishlist (array on user doc) ----------

/** Add a product ID to the user's wishlist */
export async function addToWishlist(
  uid: string,
  productId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { wishlist: arrayUnion(productId) });
}

/** Remove a product ID from the user's wishlist */
export async function removeFromWishlist(
  uid: string,
  productId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { wishlist: arrayRemove(productId) });
}

// ---------- Price Watchers (array on user doc) ----------

/** Add a price watcher for a product */
export async function addPriceWatcher(
  uid: string,
  watcher: PriceWatcher
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { priceWatchers: arrayUnion(watcher) });
}

/** Remove a price watcher for a product */
export async function removePriceWatcher(
  uid: string,
  watcher: PriceWatcher
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { priceWatchers: arrayRemove(watcher) });
}

/** Update a price watcher's target price (remove old, add new) */
export async function updatePriceWatcher(
  uid: string,
  oldWatcher: PriceWatcher,
  newTargetPrice: number
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { priceWatchers: arrayRemove(oldWatcher) });
  await updateDoc(docRef, {
    priceWatchers: arrayUnion({
      productId: oldWatcher.productId,
      targetPrice: newTargetPrice,
    }),
  });
}
