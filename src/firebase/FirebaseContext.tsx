import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { CorkboardNote, Quest, StickyNoteData, WidgetPosition, SkyMode, LampLighting } from '../types';
import { StarterStepsState } from '../components/onboarding/FirstStepsCard';

export interface UserCloudProfile {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  xp?: number;
  quests?: Quest[];
  starterSteps?: StarterStepsState;
  stickyNotes?: StickyNoteData[];
  positions?: Record<string, WidgetPosition>;
  skyMode?: SkyMode;
  lampLighting?: LampLighting;
  createdAt?: string;
  updatedAt?: string;
}

interface FirebaseContextType {
  user: User | null;
  authLoading: boolean;
  isFirebaseAvailable: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  cloudCorkNotes: CorkboardNote[];
  isCorkNotesLoadedFromCloud: boolean;
  addCorkNoteCloud: (note: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>) => Promise<string | null>;
  reactCorkNoteCloud: (noteId: string, type: 'heart' | 'coffee' | 'star' | 'fire') => Promise<void>;
  updateCorkNotePositionCloud: (noteId: string, x: number, y: number) => Promise<void>;
  deleteCorkNoteCloud: (noteId: string) => Promise<void>;
  saveUserProfileCloud: (data: Partial<UserCloudProfile>) => Promise<void>;
  loadUserProfileCloud: (uid: string) => Promise<UserCloudProfile | null>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const CORKBOARD_PATH = 'corkboard_notes';
const USERS_PATH = 'users';

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(true);
  const [cloudCorkNotes, setCloudCorkNotes] = useState<CorkboardNote[]>([]);
  const [isCorkNotesLoadedFromCloud, setIsCorkNotesLoadedFromCloud] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Test connection on boot per Firebase skill guidelines
  useEffect(() => {
    testConnection().catch(() => {
      setIsFirebaseAvailable(false);
    });
  }, []);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization for Community Corkboard Notes
  useEffect(() => {
    const notesCol = collection(db, CORKBOARD_PATH);
    const unsubscribe = onSnapshot(
      notesCol,
      (snapshot) => {
        const fetchedNotes: CorkboardNote[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const createdAtMillis =
            data.createdAt instanceof Timestamp
              ? data.createdAt.toMillis()
              : typeof data.createdAt === 'number'
              ? data.createdAt
              : Date.now();

          fetchedNotes.push({
            id: docSnap.id,
            authorId: data.authorId,
            name: data.name || 'Anonymous',
            message: data.message || '',
            color: data.color || '#fef08a',
            fontClass: data.fontClass || 'font-hand',
            emoji: data.emoji || '☕',
            createdAt: createdAtMillis,
            reactions: {
              heart: Number(data.reactions?.heart) || 0,
              coffee: Number(data.reactions?.coffee) || 0,
              star: Number(data.reactions?.star) || 0,
              fire: Number(data.reactions?.fire) || 0,
            },
            isPolaroid: Boolean(data.isPolaroid),
            polaroidTitle: data.polaroidTitle,
            polaroidPhoto: data.polaroidPhoto,
            polaroidGradient: data.polaroidGradient,
            polaroidDate: data.polaroidDate,
            washiTapeColor: data.washiTapeColor,
            polaroidImageUrl: data.polaroidImageUrl,
            polaroidFilter: data.polaroidFilter,
            category: data.category,
            x: typeof data.x === 'number' ? data.x : undefined,
            y: typeof data.y === 'number' ? data.y : undefined,
            rotation: typeof data.rotation === 'number' ? data.rotation : undefined,
          });
        });

        // Sort notes descending by createdAt
        fetchedNotes.sort((a, b) => b.createdAt - a.createdAt);
        setCloudCorkNotes(fetchedNotes);
        setIsCorkNotesLoadedFromCloud(true);
      },
      (error) => {
        // Critical error handler callback
        handleFirestoreError(error, OperationType.GET, CORKBOARD_PATH);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sign In with Google via Popup
  const signInWithGoogle = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        // Create or update user doc in Firestore
        const userDocRef = doc(db, USERS_PATH, result.user.uid);
        const existingSnap = await getDoc(userDocRef);
        if (!existingSnap.exists()) {
          await setDoc(userDocRef, {
            userId: result.user.uid,
            displayName: result.user.displayName || 'Cozy Explorer',
            email: result.user.email || '',
            photoURL: result.user.photoURL || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
      console.error('Google Sign In failed:', error);
      throw error;
    }
  }, []);

  // Sign Out
  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Add a new Corkboard note or polaroid
  const addCorkNoteCloud = useCallback(
    async (noteData: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>): Promise<string | null> => {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        throw new Error('You must be signed in with Google to post to the Community Corkboard.');
      }

      const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const docRef = doc(db, CORKBOARD_PATH, noteId);

      const payload: Record<string, any> = {
        authorId: currentUid,
        name: (noteData.name || 'Anonymous').slice(0, 64),
        message: (noteData.message || '').slice(0, 1000),
        color: (noteData.color || '#fef08a').slice(0, 32),
        fontClass: (noteData.fontClass || 'font-hand').slice(0, 32),
        emoji: (noteData.emoji || '☕').slice(0, 32),
        reactions: { heart: 1, coffee: 0, star: 0, fire: 0 },
        createdAt: serverTimestamp(),
      };

      if (noteData.isPolaroid !== undefined) payload.isPolaroid = Boolean(noteData.isPolaroid);
      if (noteData.polaroidTitle) payload.polaroidTitle = noteData.polaroidTitle.slice(0, 128);
      if (noteData.polaroidPhoto) payload.polaroidPhoto = noteData.polaroidPhoto.slice(0, 64);
      if (noteData.polaroidGradient) payload.polaroidGradient = noteData.polaroidGradient.slice(0, 128);
      if (noteData.polaroidDate) payload.polaroidDate = noteData.polaroidDate.slice(0, 64);
      if (noteData.washiTapeColor) payload.washiTapeColor = noteData.washiTapeColor.slice(0, 64);
      if (noteData.polaroidImageUrl) payload.polaroidImageUrl = noteData.polaroidImageUrl;
      if (noteData.polaroidFilter) payload.polaroidFilter = noteData.polaroidFilter.slice(0, 64);
      if (noteData.category) payload.category = noteData.category.slice(0, 32);
      if (typeof noteData.x === 'number') payload.x = noteData.x;
      if (typeof noteData.y === 'number') payload.y = noteData.y;
      if (typeof noteData.rotation === 'number') payload.rotation = noteData.rotation;

      try {
        await setDoc(docRef, payload);
        return noteId;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `${CORKBOARD_PATH}/${noteId}`);
      }
    },
    []
  );

  // React to a corkboard note (heart, coffee, star, fire)
  const reactCorkNoteCloud = useCallback(
    async (noteId: string, type: 'heart' | 'coffee' | 'star' | 'fire'): Promise<void> => {
      const docPath = `${CORKBOARD_PATH}/${noteId}`;
      try {
        const docRef = doc(db, CORKBOARD_PATH, noteId);
        await updateDoc(docRef, {
          [`reactions.${type}`]: increment(1),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    },
    []
  );

  // Update position on expanded corkboard studio
  const updateCorkNotePositionCloud = useCallback(
    async (noteId: string, x: number, y: number): Promise<void> => {
      const docPath = `${CORKBOARD_PATH}/${noteId}`;
      try {
        const docRef = doc(db, CORKBOARD_PATH, noteId);
        await updateDoc(docRef, { x, y });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    },
    []
  );

  // Delete a corkboard note
  const deleteCorkNoteCloud = useCallback(
    async (noteId: string): Promise<void> => {
      const docPath = `${CORKBOARD_PATH}/${noteId}`;
      try {
        const docRef = doc(db, CORKBOARD_PATH, noteId);
        await deleteDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    },
    []
  );

  // Save / Sync User Desk Profile & Progress
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveUserProfileCloud = useCallback(
    async (data: Partial<UserCloudProfile>): Promise<void> => {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) return;

      const docPath = `${USERS_PATH}/${currentUid}`;
      setSyncStatus('syncing');

      // Debounce slightly to prevent thrashing
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const docRef = doc(db, USERS_PATH, currentUid);
          const updatePayload: Record<string, any> = {
            userId: currentUid,
            displayName: auth.currentUser?.displayName || 'Cozy Explorer',
            email: auth.currentUser?.email || '',
            photoURL: auth.currentUser?.photoURL || '',
            updatedAt: serverTimestamp(),
          };

          if (data.xp !== undefined) updatePayload.xp = data.xp;
          if (data.quests !== undefined) updatePayload.quests = data.quests;
          if (data.starterSteps !== undefined) updatePayload.starterSteps = data.starterSteps;
          if (data.stickyNotes !== undefined) updatePayload.stickyNotes = data.stickyNotes;
          if (data.positions !== undefined) updatePayload.positions = data.positions;
          if (data.skyMode !== undefined) updatePayload.skyMode = data.skyMode;
          if (data.lampLighting !== undefined) updatePayload.lampLighting = data.lampLighting;

          await setDoc(docRef, updatePayload, { merge: true });
          setSyncStatus('synced');
        } catch (error) {
          setSyncStatus('error');
          handleFirestoreError(error, OperationType.WRITE, docPath);
        }
      }, 500);
    },
    []
  );

  // Load User Desk Profile from Firestore
  const loadUserProfileCloud = useCallback(
    async (uid: string): Promise<UserCloudProfile | null> => {
      const docPath = `${USERS_PATH}/${uid}`;
      try {
        const docRef = doc(db, USERS_PATH, uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as UserCloudProfile;
        }
        return null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, docPath);
      }
    },
    []
  );

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authLoading,
        isFirebaseAvailable,
        syncStatus,
        signInWithGoogle,
        signOutUser,
        cloudCorkNotes,
        isCorkNotesLoadedFromCloud,
        addCorkNoteCloud,
        reactCorkNoteCloud,
        updateCorkNotePositionCloud,
        deleteCorkNoteCloud,
        saveUserProfileCloud,
        loadUserProfileCloud,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
