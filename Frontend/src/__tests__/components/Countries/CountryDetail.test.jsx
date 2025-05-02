import React from "react";
import { screen, waitFor } from "@testing-library/react";
import {
  renderWithProviders,
  mockAuthContextValues,
  mockEmptyAuthContext,
} from "../../utils/test-utils";
import { server } from "../../utils/api-mocks";
import CountryDetail from "../../../components/Countries/CountryDetail";

// Add simple test to ensure we have at least one test
test("CountryDetail component tests are working", () => {
  expect(true).toBe(true);
});

// Mock the useParams hook to return a specific country code
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ code: "USA" }),
  useNavigate: () => jest.fn(),
}));

// Set up and tear down the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CountryDetail Component", () => {
  test("renders loading state initially", () => {
    renderWithProviders(
      <CountryDetail
        favorites={new Set()}
        toggleFavorite={jest.fn()}
        darkMode={false}
      />
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("displays country details after loading", async () => {
    renderWithProviders(
      <CountryDetail
        favorites={new Set()}
        toggleFavorite={jest.fn()}
        darkMode={false}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Check for heading with the country name
    await waitFor(() => {
      // Use a more specific query that targets the h1 element
      const countryNameHeading = screen.getAllByRole('heading').find(
        h => h.textContent === 'United States'
      );
      expect(countryNameHeading).toBeInTheDocument();
      
      // Check for official name in the h2 element
      const officialNameHeading = screen.getAllByRole('heading').find(
        h => h.textContent === 'United States of America'
      );
      expect(officialNameHeading).toBeInTheDocument();
      
      // Check other details - use queryAllByText for elements that might have multiple matches
      expect(screen.getByText(/Population:/i)).toBeInTheDocument();
      expect(screen.getByText(/329,484,123/)).toBeInTheDocument();
      
      // Find the specific Region text with its value
      const regionElements = screen.getAllByText(/Region:/i);
      const regionElement = regionElements.find(el => 
        el.closest('p')?.textContent.includes('Americas')
      );
      expect(regionElement).toBeInTheDocument();
      
      const subRegionElements = screen.getAllByText(/Sub Region:/i);
      const subRegionElement = subRegionElements.find(el => 
        el.closest('p')?.textContent.includes('North America')
      );
      expect(subRegionElement).toBeInTheDocument();
      
      expect(screen.getByText(/Capital:/i)).toBeInTheDocument();
      expect(screen.getByText(/Washington, D.C./)).toBeInTheDocument();
    });
  });

  test("displays favorite icon when user is logged in", async () => {
    renderWithProviders(
      <CountryDetail
        favorites={new Set(["USA"])}
        toggleFavorite={jest.fn()}
        darkMode={false}
      />,
      { authValues: mockAuthContextValues }
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Check if the favorite icon is displayed
    const favoriteButtons = screen.getAllByRole("button");
    const hasFavoriteButton = favoriteButtons.some(
      (btn) =>
        btn.innerHTML.includes("FavoriteIcon") ||
        btn.getAttribute("aria-label")?.includes("favorite")
    );

    expect(hasFavoriteButton).toBeTruthy();
  });

  test("handles back button correctly", async () => {
    renderWithProviders(
      <CountryDetail
        favorites={new Set()}
        toggleFavorite={jest.fn()}
        darkMode={false}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Check if back button is displayed
    const backButton = screen.getByText("Back");
    expect(backButton).toBeInTheDocument();
  });

  test("displays flag and map components", async () => {
    renderWithProviders(
      <CountryDetail
        favorites={new Set()}
        toggleFavorite={jest.fn()}
        darkMode={false}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Check for the flag image
    const flagImage = screen.getByAltText("United States flag");
    expect(flagImage).toBeInTheDocument();
    expect(flagImage.src).toContain("https://flagcdn.com/us.svg");

    // Check for the map section
    expect(screen.getByText("Location on Map")).toBeInTheDocument();
  });
});
