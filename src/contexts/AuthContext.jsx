import { createContext, useContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("Auth state changed:", user);
        if (user) {
          setUser({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth state listener error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Load session data on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        console.log("Loading favorites from session storage");
        const storedFavorites = sessionStorage.getItem("favorites");
        if (storedFavorites) {
          setFavorites(new Set(JSON.parse(storedFavorites)));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        setError("Failed to load favorites");
      }
    };

    loadSession();
  }, []);

  // Save favorites when they change
  useEffect(() => {
    if (favorites.size > 0) {
      console.log("Saving favorites to session storage:", [...favorites]);
      sessionStorage.setItem("favorites", JSON.stringify([...favorites]));
    } else {
      console.log("Clearing favorites from session storage");
      sessionStorage.removeItem("favorites");
    }
  }, [favorites]);

  const signIn = async () => {
    try {
      console.log("Starting sign in process");
      setError(null);
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
        login_hint: "",
      });

      // Add a small delay to ensure the popup isn't blocked
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await signInWithPopup(auth, provider);
      console.log("Sign in successful:", result.user);

      setUser({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.code === "auth/popup-blocked") {
        setError("Please allow popups for this site to sign in");
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign in was cancelled");
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection");
      } else if (error.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized for Firebase Authentication");
      } else {
        setError(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      console.log("Starting sign out process");
      setError(null);
      setLoading(true);
      await signOut(auth);
      setFavorites(new Set());
      sessionStorage.clear();
      console.log("Sign out successful");
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (countryCode) => {
    if (!user) {
      console.log("Attempted to toggle favorite while not signed in");
      setError("Please sign in to add favorites");
      return;
    }

    console.log("Toggling favorite for country:", countryCode);
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(countryCode)) {
        newFavorites.delete(countryCode);
      } else {
        newFavorites.add(countryCode);
      }
      return newFavorites;
    });
  };

  const value = {
    user,
    favorites,
    error,
    loading,
    signIn,
    signOut: signOutUser,
    toggleFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
