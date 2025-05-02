import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "../mocks/AuthContext";

// Add a simple test to avoid the "no tests" error
test("Test utilities are properly defined", () => {
  expect(mockAuthContextValues).toBeDefined();
  expect(mockEmptyAuthContext).toBeDefined();
  expect(mockCountries).toBeDefined();
  expect(renderWithProviders).toBeDefined();
});

// Mock AuthContext values for testing
export const mockAuthContextValues = {
  user: {
    uid: "test-user-id",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
  },
  favorites: new Set(["USA", "CAN", "MEX"]),
  error: null,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  toggleFavorite: jest.fn().mockImplementation((code) => {
    return Promise.resolve({ favorites: ["USA", "CAN", "MEX"], added: true });
  }),
};

// Mock empty auth context for logged out state
export const mockEmptyAuthContext = {
  user: null,
  favorites: new Set(),
  error: null,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  toggleFavorite: jest.fn(),
};

// Country data examples for tests
export const mockCountries = [
  {
    name: {
      common: "United States",
      official: "United States of America",
      nativeName: { eng: { common: "United States" } },
    },
    cca3: "USA",
    capital: ["Washington, D.C."],
    region: "Americas",
    subregion: "North America",
    languages: { eng: "English" },
    currencies: { USD: { name: "United States dollar", symbol: "$" } },
    population: 329484123,
    area: 9372610,
    flags: { svg: "https://flagcdn.com/us.svg" },
    latlng: [38, -97],
  },
  {
    name: {
      common: "Canada",
      official: "Canada",
      nativeName: { eng: { common: "Canada" } },
    },
    cca3: "CAN",
    capital: ["Ottawa"],
    region: "Americas",
    subregion: "North America",
    languages: { eng: "English", fra: "French" },
    currencies: { CAD: { name: "Canadian dollar", symbol: "$" } },
    population: 38005238,
    area: 9984670,
    flags: { svg: "https://flagcdn.com/ca.svg" },
    latlng: [60, -95],
  },
];

// Custom render with providers
export function renderWithProviders(
  ui,
  {
    authValues = mockEmptyAuthContext,
    theme = createTheme(),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthProvider value={authValues}>{children}</AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
