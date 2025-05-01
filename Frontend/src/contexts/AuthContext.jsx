import { createContext, useContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { auth } from "../config/firebase";
import MongoDBService from "../services/mongodb";

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
      async (user) => {
        console.log("Auth state changed:", user);
        if (user) {
          try {
            // Get the Firebase ID token
            const token = await getIdToken(user);
            console.log("Got ID token:", token.substring(0, 10) + "...");

            // Store the token for API requests
            MongoDBService.setAuthToken(token);

            // Set user info
            setUser({
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            });

            try {
              console.log(
                "Attempting to fetch favorites from MongoDB with user ID:",
                user.uid
              );
              const favoritesArray = await MongoDBService.getFavorites();
              console.log("Favorites received from MongoDB:", favoritesArray);
              setFavorites(new Set(favoritesArray));
            } catch (err) {
              console.error("Error fetching favorites:", err);
              console.error(
                "Error details:",
                err.response?.data || err.message
              );

              // If API fails, try loading from sessionStorage as fallback
              const storedFavorites = sessionStorage.getItem("favorites");
              if (storedFavorites) {
                console.log("Using favorites from sessionStorage as fallback");
                setFavorites(new Set(JSON.parse(storedFavorites)));
              }
            }
          } catch (error) {
            console.error("Error getting user token:", error);
          }
        } else {
          setUser(null);
          setFavorites(new Set());
          MongoDBService.setAuthToken(null);
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

  // Save favorites to sessionStorage
  useEffect(() => {
    // Only use session storage as a fallback/backup
    if (favorites.size > 0) {
      console.log("Backing up favorites to session storage (fallback only)");
      sessionStorage.setItem("favorites", JSON.stringify([...favorites]));
    } else {
      sessionStorage.removeItem("favorites");
    }
  }, [favorites]);

  const signIn = async () => {
    try {
      console.log("Starting sign in process");
      setError(null);
      setLoading(true);

      const provider = new GoogleAuthProvider();
      console.log("Created GoogleAuthProvider");

      // Try with minimal parameters
      provider.setCustomParameters({
        prompt: "select_account",
      });
      console.log("Set custom parameters");

      console.log("About to open sign-in popup");
      const result = await signInWithPopup(auth, provider);
      console.log("Sign in successful:", result.user);

      // Get the Firebase ID token
      const token = await getIdToken(result.user);
      console.log("Got ID token:", token.substring(0, 10) + "...");

      MongoDBService.setAuthToken(token);

      setUser({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });

      console.log("User state updated after login");
    } catch (error) {
      console.error("Error signing in:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

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
      await firebaseSignOut(auth);
      setFavorites(new Set());
      sessionStorage.clear();
      MongoDBService.setAuthToken(null);
      console.log("Sign out successful");
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (countryCode) => {
    if (!user) {
      console.log("Attempted to toggle favorite while not signed in");
      setError("Please sign in to add favorites");
      return;
    }

    console.log("Toggling favorite for country:", countryCode);

    // Optimistically update UI
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(countryCode)) {
        newFavorites.delete(countryCode);
      } else {
        newFavorites.add(countryCode);
      }
      return newFavorites;
    });

    // Update database - THIS PART IS CRUCIAL
    try {
      console.log("Sending toggle request to backend API");
      const response = await MongoDBService.toggleFavorite(countryCode);
      console.log("Toggle response from server:", response);
    } catch (error) {
      console.error("Error toggling favorite in database:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError("Failed to update favorites. Please try again.");

      // Revert the optimistic update on error
      setFavorites((prevFavorites) => {
        const newFavorites = new Set(prevFavorites);
        if (newFavorites.has(countryCode)) {
          newFavorites.delete(countryCode);
        } else {
          newFavorites.add(countryCode);
        }
        return newFavorites;
      });
    }
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
