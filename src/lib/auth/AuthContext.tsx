"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppUser } from "@/types/user.types";
import { getUserByUid, createUser } from "@/lib/firestore/users";
import { generateFriendCode } from "@/lib/utils";

// Types

type AuthState = {
  // Firebase Auth user
  firebaseUser: User | null;
  // Firestore user profile
  appUser: AppUser | null;
  // True while the initial auth state is being resolved
  loading: boolean;
};

type AuthActions = {
  // Create account with email/password, then create firestore user doc
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  // Sign in with email/password
  signIn: (email: string, password: string) => Promise<void>;
  // Sign in with Google 
  signInWithGoogle: () => Promise<void>;
  // Sign out
  signOut: () => Promise<void>;
  // Re-fetch the firestore user profile (for updates)
  refreshAppUser: () => Promise<void>;
};

// Context

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Firestore user profile for a given UID
  async function fetchAppUser(uid: string): Promise<AppUser | null> {
    try {
      return await getUserByUid(uid);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  }

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const profile = await fetchAppUser(user.uid);
        setAppUser(profile);
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Operations

  async function signUp(
    email: string,
    password: string,
    displayName: string,
  ): Promise<void> {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Set displayName on Firebase Auth profile
    await updateProfile(credential.user, { displayName });

    // Create firestore user document
    await createUser({
      uid: credential.user.uid,
      email: credential.user.email!,
      displayName,
      friendCode: generateFriendCode(),
    });

    // Fetch the created firestore profile
    const profile = await fetchAppUser(credential.user.uid);
    setAppUser(profile);
  }

  async function signIn(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Fetch Firestore profile
    const profile = await fetchAppUser(credential.user.uid);
    setAppUser(profile);
  }

  async function signInWithGoogleAction(): Promise<void> {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;

    // Check if Firestore user doc already exists
    let profile = await fetchAppUser(user.uid);

    if (!profile) {
      // First-time Google sign in creates firestore user doc
      await createUser({
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!.split("@")[0],
        friendCode: generateFriendCode(),
      });
      profile = await fetchAppUser(user.uid);
    }

    setAppUser(profile);
  }

  async function signOutAction(): Promise<void> {
    await firebaseSignOut(auth);
    setAppUser(null);
  }

  async function refreshAppUser(): Promise<void> {
    if (firebaseUser) {
      const profile = await fetchAppUser(firebaseUser.uid);
      setAppUser(profile);
    }
  }

  // Value
  const value: AuthContextValue = {
    firebaseUser,
    appUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle: signInWithGoogleAction,
    signOut: signOutAction,
    refreshAppUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook 
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
