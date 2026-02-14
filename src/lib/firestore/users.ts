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
import { AppUser, PriceWatcher, SavedAddress, UserRole } from "@/types/user.types";

const COLLECTION = "users";

/** Convert a Firestore document to AppUser */
function docToUser(docSnap: any): AppUser {
  const data = docSnap.data();
  return {
    ...data,
    uid: docSnap.id,
    addresses: data.addresses ?? [],
    wishlist: data.wishlist ?? [],
    priceWatchers: data.priceWatchers ?? [],
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as AppUser;
}

// Read

/** Get a user by UID */
export async function getUserByUid(uid: string): Promise<AppUser | null> {
  const docRef = doc(db, COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToUser(docSnap);
}

// Write

/** Create a new user document */
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

// Wishlist

/** Add a product ID to user wishlist */
export async function addToWishlist(
  uid: string,
  productId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { wishlist: arrayUnion(productId) });
}

/** Remove a product ID from user wishlist */
export async function removeFromWishlist(
  uid: string,
  productId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { wishlist: arrayRemove(productId) });
}

// Price Watcher

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

/** Update a price watchers target price */
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

/** Save the current cart items to user firestore doc */
export async function saveUserCart(
  uid: string,
  items: Record<string, unknown>[]
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { cart: items });
}

/** Read the cart items from user firestore doc */
export async function getUserCart(
  uid: string
): Promise<Record<string, unknown>[]> {
  const docRef = doc(db, COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return [];
  return (docSnap.data().cart as Record<string, unknown>[]) ?? [];
}

const MAX_ADDRESSES = 3;

/** Add a saved address to user profile (max 3) */
export async function addUserAddress(
  uid: string,
  address: SavedAddress
): Promise<void> {
  const user = await getUserByUid(uid);
  if (!user) throw new Error("User not found");
  if (user.addresses.length >= MAX_ADDRESSES)
    throw new Error("Maximum 3 addresses allowed");
  const addresses = [...user.addresses, address];
  await updateDoc(doc(db, COLLECTION, uid), { addresses });
}

/** Update an existing saved address by ID */
export async function updateUserAddress(
  uid: string,
  address: SavedAddress
): Promise<void> {
  const user = await getUserByUid(uid);
  if (!user) throw new Error("User not found");
  const addresses = user.addresses.map((a) =>
    a.id === address.id ? address : a
  );
  await updateDoc(doc(db, COLLECTION, uid), { addresses });
}

/** Delete a saved address by ID */
export async function deleteUserAddress(
  uid: string,
  addressId: string
): Promise<void> {
  const user = await getUserByUid(uid);
  if (!user) throw new Error("User not found");
  const addresses = user.addresses.filter((a) => a.id !== addressId);
  await updateDoc(doc(db, COLLECTION, uid), { addresses });
}
