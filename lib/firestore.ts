import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Roadmap } from "./openrouter";
import { YouTubeVideo } from "./youtube";

export interface TopicWithVideo {
  title: string;
  description: string;
  searchQuery: string;
  video?: YouTubeVideo;
}

export interface PhaseWithVideos {
  title: string;
  topics: TopicWithVideo[];
}

export interface SavedRoadmap {
  id: string;
  userId: string;
  title: string;
  topic: string;
  phases: PhaseWithVideos[];
  addedToLearning: boolean;
  createdAt: unknown;
}

// Strip undefined values from phases so Firestore doesn't reject them
function sanitizePhases(phases: PhaseWithVideos[]): PhaseWithVideos[] {
  return phases.map((phase) => ({
    title: phase.title,
    topics: phase.topics.map((t) => ({
      title: t.title,
      description: t.description,
      searchQuery: t.searchQuery,
      ...(t.video ? { video: t.video } : {}),
    })),
  }));
}

export async function saveRoadmap(
  userId: string,
  topic: string,
  roadmap: Roadmap,
  phases: PhaseWithVideos[]
): Promise<string> {
  const roadmapId = `${userId}_${Date.now()}`;
  const docRef = doc(db, "roadmaps", roadmapId);

  await setDoc(docRef, {
    id: roadmapId,
    userId,
    title: roadmap.title,
    topic,
    phases: sanitizePhases(phases),
    addedToLearning: false,
    createdAt: serverTimestamp(),
  });

  return roadmapId;
}

export async function getUserRoadmaps(userId: string): Promise<SavedRoadmap[]> {
  const q = query(collection(db, "roadmaps"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as SavedRoadmap);
}

export async function getLearningRoadmaps(userId: string): Promise<SavedRoadmap[]> {
  const q = query(
    collection(db, "roadmaps"),
    where("userId", "==", userId),
    where("addedToLearning", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as SavedRoadmap);
}

export async function getRoadmap(roadmapId: string): Promise<SavedRoadmap | null> {
  const docRef = doc(db, "roadmaps", roadmapId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data() as SavedRoadmap;
  }
  return null;
}

export async function addToLearning(roadmapId: string): Promise<void> {
  const docRef = doc(db, "roadmaps", roadmapId);
  await setDoc(docRef, { addedToLearning: true }, { merge: true });
}

export async function removeFromLearning(roadmapId: string): Promise<void> {
  const docRef = doc(db, "roadmaps", roadmapId);
  await setDoc(docRef, { addedToLearning: false }, { merge: true });
}

export async function deleteRoadmap(roadmapId: string): Promise<void> {
  const docRef = doc(db, "roadmaps", roadmapId);
  await deleteDoc(docRef);
}

export async function updateRoadmapPhases(
  roadmapId: string,
  phases: PhaseWithVideos[]
): Promise<void> {
  const docRef = doc(db, "roadmaps", roadmapId);
  await setDoc(docRef, { phases: sanitizePhases(phases) }, { merge: true });
}
