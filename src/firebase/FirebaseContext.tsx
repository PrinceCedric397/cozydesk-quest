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

export const getOrCreateGuestId = (): string => {
  try {
    let gid = localStorage.getItem('cozydesk_guest_id');
    if (!gid || !/^[a-zA-Z0-9_\-]+$/.test(gid)) {
      gid = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('cozydesk_guest_id', gid);
    }
    return gid;
  } catch {
    return 'guest_desk';
  }
};

interface FirebaseContextType {
  user: User | null;
  authLoading: boolean;
  isFirebaseAvailable: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  cloudCorkNotes: CorkboardNote[];
  isCorkNotesLoadedFromCloud: boolean;
  addCorkNoteCloud: (
    note: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>,
    customId?: string
  ) => Promise<string | null>;
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
  const [authError, setAuthError] = useState<string | null>(null);
  const isSigningInRef = useRef(false);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Test connection on boot per Firebase skill guidelines
  useEffect(() => {
    testConnection().catch(() => {
      setIsFirebaseAvailable(false);
    });
  }, []);

  // Monitor Authentication State
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
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
  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    if (isSigningInRef.current) {
      return auth.currentUser;
    }
    isSigningInRef.current = true;

    try {
      setSyncStatus('syncing');
      setAuthError(null);

      const signResult = await signInWithPopup(auth, googleProvider);
      const signedInUser = signResult.user;

      if (signedInUser) {
        setUser(signedInUser);
        // Create or update user doc in Firestore
        try {
          const userDocRef = doc(db, USERS_PATH, signedInUser.uid);
          const existingSnap = await getDoc(userDocRef);
          const defaultDisplayName = (signedInUser.displayName || 'Cozy Explorer').slice(0, 128);
          const userEmail = (signedInUser.email || '').slice(0, 256);
          const userPhoto = (signedInUser.photoURL || '').slice(0, 2048);

          const initialPayload: Record<string, any> = {
            userId: signedInUser.uid,
            displayName: defaultDisplayName,
            email: userEmail,
            photoURL: userPhoto,
            updatedAt: serverTimestamp(),
          };
          if (!existingSnap.exists()) {
            initialPayload.createdAt = serverTimestamp();
          }
          await setDoc(userDocRef, initialPayload, { merge: true });
        } catch (dbErr) {
          console.warn('Initial profile sync notice:', dbErr);
        }
      }
      setSyncStatus('synced');
      return signedInUser;
    } catch (error: any) {
      const code = error?.code || '';
      const msg = error?.message || String(error || '');

      // Recover gracefully from Firebase internal assertion error during popup handling
      if (msg.includes('Pending promise was never set')) {
        if (auth.currentUser) {
          setUser(auth.currentUser);
          setSyncStatus('synced');
          setAuthError(null);
          return auth.currentUser;
        }
        setSyncStatus('idle');
        return null;
      }

      // User closed popup
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled' ||
        msg.includes('auth/popup-closed-by-user') ||
        msg.includes('auth/cancelled-popup-request')
      ) {
        setSyncStatus('idle');
        setAuthError(null);
        return null;
      }

      // Browser blocked popup
      if (code === 'auth/popup-blocked' || msg.includes('auth/popup-blocked')) {
        setSyncStatus('idle');
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
        return null;
      }

      setSyncStatus('error');
      const friendlyNotice = msg.replace(/^Firebase:\s*/, '') || 'Sign-in could not be completed.';
      setAuthError(friendlyNotice);
      return null;
    } finally {
      isSigningInRef.current = false;
    }
  }, []);

  // Sign Out
  const signOutUser = useCallback(async (): Promise<void> => {
    try {
      setSyncStatus('idle');
      setAuthError(null);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.warn('Sign out notice:', error);
    }
  }, []);

  // Add a new Corkboard note or polaroid
  const addCorkNoteCloud = useCallback(
    async (
      noteData: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>,
      customId?: string
    ): Promise<string | null> => {
      const guestId = getOrCreateGuestId();
      const currentUid = auth.currentUser?.uid || `guest_${guestId}`;
      const noteId = customId || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const docRef = doc(db, CORKBOARD_PATH, noteId);
      const defaultName = auth.currentUser?.displayName || 'Anonymous';

      const payload: Record<string, any> = {
        authorId: currentUid,
        name: (noteData.name || defaultName).slice(0, 64),
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
      if (noteData.polaroidImageUrl) {
        // Enforce maximum photo data URI size constraint (500KB)
        payload.polaroidImageUrl = noteData.polaroidImageUrl.slice(0, 480000);
      }
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
        throw error;
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
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        // Guests cannot modify cloud document coordinates
        return;
      }
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
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        return;
      }
      // Optimistically remove from cloud notes state immediately
      setCloudCorkNotes((prev) => prev.filter((n) => n.id !== noteId));
      const docPath = `${CORKBOARD_PATH}/${noteId}`;
      try {
        const docRef = doc(db, CORKBOARD_PATH, noteId);
        await deleteDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
        throw error;
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
          const existingSnap = await getDoc(docRef);
          const defaultDisplayName = (
            auth.currentUser?.isAnonymous
              ? 'Guest Explorer'
              : (auth.currentUser?.displayName || 'Cozy Explorer')
          ).slice(0, 128);
          const emailStr = (auth.currentUser?.email || '').slice(0, 256);
          const photoUrlStr = (auth.currentUser?.photoURL || '').slice(0, 2048);

          const updatePayload: Record<string, any> = {
            userId: currentUid,
            displayName: defaultDisplayName,
            email: emailStr,
            photoURL: photoUrlStr,
            updatedAt: serverTimestamp(),
          };

          if (!existingSnap.exists()) {
            updatePayload.createdAt = serverTimestamp();
          }

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

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
        authError,
        clearAuthError,
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

