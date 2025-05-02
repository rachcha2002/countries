// Simple API mock for tests - no MSW dependency
import { mockCountries } from "./test-utils";
import axios from "axios";

// Create a test to satisfy Jest
test("API mocks are defined", () => {
  expect(mockAxios).toBeDefined();
  expect(server).toBeDefined();
});

// Create mock country data to return in tests
const mockCountriesResponse = {
  data: mockCountries,
};

// Mock axios instead of fetch since that's what components are using
jest.mock("axios");

const mockAxios = {
  get: jest.fn((url) => {
    if (url === "https://restcountries.com/v3.1/all") {
      return Promise.resolve(mockCountriesResponse);
    } else if (url.includes("/name/")) {
      const name = url.split("/name/")[1].split("?")[0];
      const filteredCountries = mockCountries.filter((country) =>
        country.name.common.toLowerCase().includes(name.toLowerCase())
      );
      return Promise.resolve({ data: filteredCountries });
    } else if (url.includes("/alpha/")) {
      const code = url.split("/alpha/")[1].split("?")[0];
      const country = mockCountries.find((c) => c.cca3 === code);
      return Promise.resolve({ data: [country] });
    } else if (url.includes("/region/")) {
      const region = url.split("/region/")[1].split("?")[0];
      const filteredCountries = mockCountries.filter(
        (country) => country.region.toLowerCase() === region.toLowerCase()
      );
      return Promise.resolve({ data: filteredCountries });
    } else if (url.includes("/lang/")) {
      const lang = decodeURIComponent(url.split("/lang/")[1].split("?")[0]);
      const filteredCountries = mockCountries.filter(
        (country) =>
          country.languages &&
          Object.values(country.languages).some(
            (l) => l.toLowerCase() === lang.toLowerCase()
          )
      );
      return Promise.resolve({ data: filteredCountries });
    } else if (url.includes("/currency/")) {
      const currency = url.split("/currency/")[1].split("?")[0];
      const filteredCountries = mockCountries.filter(
        (country) =>
          country.currencies &&
          Object.keys(country.currencies).some(
            (c) => c.toLowerCase() === currency.toLowerCase()
          )
      );
      return Promise.resolve({ data: filteredCountries });
    }

    // Default fallback
    return Promise.resolve({ data: [] });
  }),
};

// Set the mock implementation for axios in tests
axios.get.mockImplementation(mockAxios.get);

// Mock server object with setup/teardown to satisfy existing test code
export const server = {
  listen: jest.fn(),
  resetHandlers: jest.fn(),
  close: jest.fn(),
};

export { mockAxios };
