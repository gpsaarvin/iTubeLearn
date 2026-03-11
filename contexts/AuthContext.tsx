"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getLearningRoadmaps, SavedRoadmap } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  learningList: SavedRoadmap[];
  refreshLearningList: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  learningList: [],
  refreshLearningList: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [learningList, setLearningList] = useState<SavedRoadmap[]>([]);

  const refreshLearningList = useCallback(async () => {
    if (user) {
      const roadmaps = await getLearningRoadmaps(user.uid);
      setLearningList(roadmaps);
    } else {
      setLearningList([]);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, logout, learningList, refreshLearningList }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
