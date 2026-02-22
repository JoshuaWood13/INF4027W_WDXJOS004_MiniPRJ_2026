import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  documentId,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AppUser,
  IncomingRequest,
  OutgoingRequest,
  PriceWatcher,
  SavedAddress,
  UserRole,
} from "@/types/user.types";

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
    friendCode: data.friendCode ?? "",
    friends: data.friends ?? [],
    incomingRequests: (data.incomingRequests ?? []).map((r: any) => ({
      ...r,
      sentAt: r.sentAt?.toDate?.() ?? new Date(),
    })),
    outgoingRequests: (data.outgoingRequests ?? []).map((r: any) => ({
      ...r,
      sentAt: r.sentAt?.toDate?.() ?? new Date(),
    })),
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
  friendCode?: string;
}): Promise<void> {
  await setDoc(doc(db, COLLECTION, data.uid), {
    email: data.email,
    displayName: data.displayName,
    role: data.role ?? "customer",
    wishlist: [],
    priceWatchers: [],
    friendCode: data.friendCode ?? "",
    friends: [],
    incomingRequests: [],
    outgoingRequests: [],
    createdAt: Timestamp.now(),
  });
}

/** Update user profile fields */
export async function updateUser(
  uid: string,
  data: Partial<Omit<AppUser, "uid" | "createdAt">>,
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { ...data });
}

// Friend System

/** Get a user by their unique friend code */
export async function getUserByFriendCode(
  code: string,
): Promise<AppUser | null> {
  const q = query(collection(db, COLLECTION), where("friendCode", "==", code));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToUser(snapshot.docs[0]);
}

/** Add a friend UID to the friends array */
export async function addFriend(uid: string, friendUid: string): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { friends: arrayUnion(friendUid) });
}

/** Remove a friend UID from friends array */
export async function removeFriend(
  uid: string,
  friendUid: string,
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { friends: arrayRemove(friendUid) });
}

/** Fetch display names for a list of friend UIDs (batches at 10 per Firestore limit) */
export async function getFriendProfiles(
  uids: string[],
): Promise<{ uid: string; displayName: string }[]> {
  if (uids.length === 0) return [];

  const results: { uid: string; displayName: string }[] = [];

  const BATCH_SIZE = 10;
  for (let i = 0; i < uids.length; i += BATCH_SIZE) {
    const batch = uids.slice(i, i + BATCH_SIZE);
    const q = query(
      collection(db, COLLECTION),
      where(documentId(), "in", batch),
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((d) => {
      results.push({ uid: d.id, displayName: d.data().displayName ?? "" });
    });
  }

  return results;
}

// Friend Requests

/**
 * Send a friend request by entering a friend code.
 * Writes to the sender's outgoingRequests and the target's incomingRequests.
 * Returns null on success, or an error string describing the problem.
 */
export async function sendFriendRequest(
  fromUid: string,
  fromDisplayName: string,
  toFriendCode: string,
  currentFriends: string[],
  outgoingRequests: OutgoingRequest[],
): Promise<string | null> {
  const target = await getUserByFriendCode(toFriendCode);

  if (!target) return "User not found. Check the friend code and try again.";
  if (target.uid === fromUid) return "That's your own friend code!";
  if (currentFriends.includes(target.uid))
    return "You're already friends with this user.";
  if (outgoingRequests.some((r) => r.toUid === target.uid))
    return "You've already sent a friend request to this user.";
  // Check if target has already sent a request
  if (target.outgoingRequests.some((r) => r.toUid === fromUid))
    return "This user has already sent you a friend request — check your activity section.";

  const sentAt = Timestamp.now();

  await Promise.all([
    updateDoc(doc(db, COLLECTION, fromUid), {
      outgoingRequests: arrayUnion({ toUid: target.uid, sentAt }),
    }),
    updateDoc(doc(db, COLLECTION, target.uid), {
      incomingRequests: arrayUnion({ fromUid, fromDisplayName, sentAt }),
    }),
  ]);

  return null;
}

/**
 * Accept a friend request.
 * Removes the request from both users' arrays, then adds each to the other's friends list.
 */
export async function acceptFriendRequest(
  currentUid: string,
  fromUid: string,
): Promise<void> {
  const [currentSnap, senderSnap] = await Promise.all([
    getDoc(doc(db, COLLECTION, currentUid)),
    getDoc(doc(db, COLLECTION, fromUid)),
  ]);

  const currentData = currentSnap.data();
  const senderData = senderSnap.data();

  const updates: Promise<void>[] = [];

  if (currentData) {
    const filtered = (currentData.incomingRequests ?? []).filter(
      (r: any) => r.fromUid !== fromUid,
    );
    updates.push(
      updateDoc(doc(db, COLLECTION, currentUid), {
        incomingRequests: filtered,
      }),
    );
  }

  if (senderData) {
    const filtered = (senderData.outgoingRequests ?? []).filter(
      (r: any) => r.toUid !== currentUid,
    );
    updates.push(
      updateDoc(doc(db, COLLECTION, fromUid), { outgoingRequests: filtered }),
    );
  }

  // Add friends bidirectionally
  updates.push(addFriend(currentUid, fromUid), addFriend(fromUid, currentUid));

  await Promise.all(updates);
}

/**
 * Decline a friend request.
 * Removes the request from both user arrays without adding to friends.
 */
export async function declineFriendRequest(
  currentUid: string,
  fromUid: string,
): Promise<void> {
  const [currentSnap, senderSnap] = await Promise.all([
    getDoc(doc(db, COLLECTION, currentUid)),
    getDoc(doc(db, COLLECTION, fromUid)),
  ]);

  const currentData = currentSnap.data();
  const senderData = senderSnap.data();

  const updates: Promise<void>[] = [];

  if (currentData) {
    const filtered = (currentData.incomingRequests ?? []).filter(
      (r: any) => r.fromUid !== fromUid,
    );
    updates.push(
      updateDoc(doc(db, COLLECTION, currentUid), {
        incomingRequests: filtered,
      }),
    );
  }

  if (senderData) {
    const filtered = (senderData.outgoingRequests ?? []).filter(
      (r: any) => r.toUid !== currentUid,
    );
    updates.push(
      updateDoc(doc(db, COLLECTION, fromUid), { outgoingRequests: filtered }),
    );
  }

  await Promise.all(updates);
}

// Wishlist

/** Add a product ID to user wishlist */
export async function addToWishlist(
  uid: string,
  productId: string,
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { wishlist: arrayUnion(productId) });
}

/** Remove a product ID from user wishlist */
export async function removeFromWishlist(
  uid: string,
  productId: string,
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { wishlist: arrayRemove(productId) });
}

// Price Watcher

/** Add a price watcher for a product */
export async function addPriceWatcher(
  uid: string,
  watcher: PriceWatcher,
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { priceWatchers: arrayUnion(watcher) });
}

/** Remove a price watcher for a product */
export async function removePriceWatcher(
  uid: string,
  watcher: PriceWatcher,
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { priceWatchers: arrayRemove(watcher) });
}

/** Update a price watchers target price */
export async function updatePriceWatcher(
  uid: string,
  oldWatcher: PriceWatcher,
  newTargetPrice: number,
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
  items: Record<string, unknown>[],
): Promise<void> {
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, { cart: items });
}

/** Read the cart items from user firestore doc */
export async function getUserCart(
  uid: string,
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
  address: SavedAddress,
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
  address: SavedAddress,
): Promise<void> {
  const user = await getUserByUid(uid);
  if (!user) throw new Error("User not found");
  const addresses = user.addresses.map((a) =>
    a.id === address.id ? address : a,
  );
  await updateDoc(doc(db, COLLECTION, uid), { addresses });
}

/** Delete a saved address by ID */
export async function deleteUserAddress(
  uid: string,
  addressId: string,
): Promise<void> {
  const user = await getUserByUid(uid);
  if (!user) throw new Error("User not found");
  const addresses = user.addresses.filter((a) => a.id !== addressId);
  await updateDoc(doc(db, COLLECTION, uid), { addresses });
}
