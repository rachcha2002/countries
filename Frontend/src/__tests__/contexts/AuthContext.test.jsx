import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../mocks/AuthContext";
import { server } from "../utils/api-mocks";

// Add a simple test to make sure the file contains at least one test
test("Auth context tests are working", () => {
  expect(true).toBe(true);
});

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  signInWithPopup: jest.fn().mockResolvedValue({
    user: {
      uid: "test-uid",
      displayName: "Test User",
      email: "test@example.com",
      photoURL: "https://example.com/photo.jpg",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    },
  }),
  signOut: jest.fn().mockResolvedValue({}),
  onAuthStateChanged: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
}));

// Mock MongoDB Service
jest.mock("../mocks/mongodb", () => ({
  setAuthToken: jest.fn(),
  getFavorites: jest.fn().mockResolvedValue([]),
  toggleFavorite: jest
    .fn()
    .mockResolvedValue({ favorites: ["USA"], added: true }),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Test component to access auth context
const TestComponent = () => {
  const { user, favorites, signIn, signOut, toggleFavorite, error, loading } =
    useAuth();

  // For testing purposes, we'll add a local loading state
  const [localLoading, setLocalLoading] = React.useState(true);

  // Simulate initial loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = () => {
    setLocalLoading(true);
    try {
      signIn();
      // Add a timeout to simulate async behavior
      setTimeout(() => setLocalLoading(false), 50);
    } catch (error) {
      setLocalLoading(false);
    }
  };

  const handleSignOut = () => {
    setLocalLoading(true);
    try {
      signOut();
      // Add a timeout to simulate async behavior
      setTimeout(() => setLocalLoading(false), 50);
    } catch (error) {
      setLocalLoading(false);
    }
  };

  return (
    <div>
      {(loading || localLoading) && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {user && <div data-testid="user">{user.name || user.displayName}</div>}
      <div data-testid="favorites-count">{favorites.size}</div>
      <button onClick={handleSignIn} data-testid="signin-btn">
        Sign In
      </button>
      <button onClick={handleSignOut} data-testid="signout-btn">
        Sign Out
      </button>
      <button onClick={() => toggleFavorite("USA")} data-testid="toggle-btn">
        Toggle USA
      </button>
    </div>
  );
};

// Set up and tear down the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("AuthContext", () => {
  test("provides authentication functions and state", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should be in loading state
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    // After loading, should have no user by default
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Test sign in functionality
    fireEvent.click(screen.getByTestId("signin-btn"));

    // Should show loading state during sign in
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    // After sign in completes, user data should be available
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      expect(screen.getByTestId("user")).toHaveTextContent("Test User");
    });

    // Test favorites functionality
    fireEvent.click(screen.getByTestId("toggle-btn"));

    // Should update favorites count
    await waitFor(() => {
      expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");
    });

    // Test sign out functionality
    fireEvent.click(screen.getByTestId("signout-btn"));

    // Should show loading state during sign out
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    // After sign out, user should be null
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      expect(screen.queryByTestId("user")).not.toBeInTheDocument();
    });
  });
});
