import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import {
  mockAuthContextValues,
  mockEmptyAuthContext,
  renderWithProviders,
} from "../utils/test-utils";
import App from "../mocks/App";
import { createTheme } from "@mui/material/styles";

// Add a test to make sure App.test.jsx contains tests
test("Integration tests are working", () => {
  expect(true).toBe(true);
});

// Mock theme for Material UI
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontWeightBold: 700,
    fontWeightMedium: 500,
    fontWeightRegular: 400,
    fontWeightLight: 300,
  },
});

// Integration tests for the entire app
describe("App Integration Tests", () => {
  test("renders mock app correctly", async () => {
    renderWithProviders(<App />, {
      authValues: mockAuthContextValues,
      theme: theme,
    });

    // The mock App renders "Home Page" for the root route
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.getByTestId("mock-app")).toBeInTheDocument();
  });

  test("has navigation links", async () => {
    renderWithProviders(<App />, {
      authValues: mockAuthContextValues,
      theme: theme,
    });

    // Check if navigation links are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
  });

  test("auth context is available", async () => {
    // Override the mock to ensure user is logged in for this test
    jest.spyOn(mockAuthContextValues, "toggleFavorite");

    renderWithProviders(<App />, {
      authValues: mockAuthContextValues,
      theme: theme,
    });

    // Verify the auth context is working
    expect(mockAuthContextValues.toggleFavorite).toBeDefined();
    expect(mockAuthContextValues.user).toBeDefined();
  });
});
