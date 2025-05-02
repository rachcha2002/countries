// Mock implementation of AuthContext - replaces the real one during tests
import React, { createContext, useContext, useState } from "react";

// Create the context
const AuthContext = createContext();

// Default mock values
export const mockAuthValues = {
  user: {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
  },
  favorites: new Set(),
  error: null,
  loading: false,
  signIn: jest.fn().mockImplementation(() => Promise.resolve()),
  signOut: jest.fn().mockImplementation(() => Promise.resolve()),
  toggleFavorite: jest.fn().mockImplementation((code) => {
    return Promise.resolve({ favorites: ["USA"], added: true });
  }),
};

// Use auth hook that mimics the real implementation
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // In tests, provide default mock values if context is missing
    // This helps avoid the "must be used within AuthProvider" error in tests
    console.warn(
      "Auth context missing in test environment, using default mocks"
    );
    return mockAuthValues;
  }
  return context;
};

// Provider component that accepts mock values for testing
export const AuthProvider = ({ children, value = mockAuthValues }) => {
  // Create a stateful version of favorites so the test can update it
  const [favorites, setFavorites] = useState(new Set());
  // Add user state for sign-in/sign-out functionality
  const [user, setUser] = useState(value.user);

  // Override the toggleFavorite method to update the favorites state
  const enhancedValue = {
    ...value,
    user,
    favorites,
    signIn: jest.fn().mockImplementation(() => {
      setUser(value.user);
      return Promise.resolve(value.user);
    }),
    signOut: jest.fn().mockImplementation(() => {
      setUser(null);
      setFavorites(new Set());
      return Promise.resolve();
    }),
    toggleFavorite: jest.fn().mockImplementation((code) => {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(code)) {
        newFavorites.delete(code);
      } else {
        newFavorites.add(code);
      }
      setFavorites(newFavorites);
      return Promise.resolve({
        favorites: Array.from(newFavorites),
        added: newFavorites.has(code),
      });
    }),
  };

  return (
    <AuthContext.Provider value={enhancedValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
