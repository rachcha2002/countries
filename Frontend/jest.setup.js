// jest.setup.js
require("@testing-library/jest-dom");

// Mock the environment variables
global.process.env.VITE_FIREBASE_API_KEY = "test-api-key";
global.process.env.VITE_FIREBASE_AUTH_DOMAIN = "test-auth-domain";
global.process.env.VITE_FIREBASE_PROJECT_ID = "test-project-id";
global.process.env.VITE_FIREBASE_STORAGE_BUCKET = "test-storage-bucket";
global.process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = "test-sender-id";
global.process.env.VITE_FIREBASE_APP_ID = "test-app-id";
global.process.env.VITE_GOOGLE_MAPS_API_KEY = "test-maps-api-key";

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
