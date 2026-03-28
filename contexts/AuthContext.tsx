"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getLearningRoadmaps, SavedRoadmap } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  learningList: SavedRoadmap[];
  refreshLearningList: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  learningList: [],
  refreshLearningList: async () => {},
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [learningList, setLearningList] = useState<SavedRoadmap[]>([]);

  const syncProfileFromGoogleProvider = useCallback(async (authUser: User) => {
    const googleData = authUser.providerData.find((p) => p?.providerId === "google.com");
    if (!googleData) {
      return;
    }

    const googleDisplayName = googleData.displayName?.trim() || undefined;
    const googlePhotoURL = googleData.photoURL || undefined;

    const shouldUpdateName = !!googleDisplayName && googleDisplayName !== authUser.displayName;
    const shouldUpdatePhoto = !!googlePhotoURL && googlePhotoURL !== authUser.photoURL;

    if (!shouldUpdateName && !shouldUpdatePhoto) {
      return;
    }

    await updateProfile(authUser, {
      displayName: googleDisplayName,
      photoURL: googlePhotoURL,
    });

    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        displayName: googleDisplayName || prev.displayName,
        photoURL: googlePhotoURL || prev.photoURL,
      } as User;
    });
  }, []);

  const refreshLearningList = useCallback(async () => {
    if (user) {
      const roadmaps = await getLearningRoadmaps(user.uid);
      setLearningList(roadmaps);
    } else {
      setLearningList([]);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (nextUser) {
        void syncProfileFromGoogleProvider(nextUser);
      }
    });
    return unsubscribe;
  }, [syncProfileFromGoogleProvider]);

  useEffect(() => {
    refreshLearningList();
  }, [refreshLearningList]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setLearningList([]);
  };

  const updateUserProfileDetails = async (displayName: string) => {
    if (!auth.currentUser) {
      return;
    }

    await updateProfile(auth.currentUser, {
      displayName,
    });

    setUser((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        displayName,
      } as User;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        learningList,
        refreshLearningList,
        updateUserProfile: updateUserProfileDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
