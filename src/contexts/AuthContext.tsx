import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  FirebaseUser,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from '../lib/firebase';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  aiStudioKey?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveAiStudioKey: (key: string) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile({
          uid: firebaseUser.uid,
          displayName: data.displayName || firebaseUser.displayName,
          email: data.email || firebaseUser.email,
          photoURL: data.photoURL || firebaseUser.photoURL,
          aiStudioKey: data.aiStudioKey || ''
        });
      } else {
        // Crear documento inicial si es primer ingreso
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          aiStudioKey: ''
        };
        await setDoc(userRef, {
          ...newProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setProfile(newProfile);
      }
    } catch (e) {
      console.warn("Error cargando perfil del usuario:", e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Error al iniciar sesión con Google:", err);
      // Mensaje amigable si el popup fue cancelado por el usuario o bloqueado
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Inicio de sesión cancelado.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignorar requests duplicadas
      } else {
        setAuthError(err.message || 'No se pudo conectar con Google.');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      setUser(null);
    } catch (err: any) {
      console.error("Error cerrando sesión:", err);
    }
  };

  const saveAiStudioKey = async (key: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        aiStudioKey: key.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setProfile(prev => prev ? { ...prev, aiStudioKey: key.trim() } : null);
    } catch (e: any) {
      console.error("Error guardando clave de AI Studio:", e);
      throw e;
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signInWithGoogle,
      signOut,
      saveAiStudioKey,
      authError,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }
  return context;
};
