/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", { configFile: "./babel.config.cjs" }],
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    // Ensure any path that ends with AuthContext.jsx uses our mock
    "(.*/)?contexts/AuthContext(.jsx)?$":
      "<rootDir>/src/__tests__/mocks/AuthContext.jsx",
    "(.*/)?contexts/AuthContext$":
      "<rootDir>/src/__tests__/mocks/AuthContext.jsx",
    "(.*/)?services/mongodb(.js)?$": "<rootDir>/src/__tests__/mocks/mongodb.js",
    "(.*/)?config/firebase(.js)?$": "<rootDir>/src/__tests__/mocks/firebase.js",
    "(.*/)?MapContainer(.jsx)?$":
      "<rootDir>/src/__tests__/mocks/MapContainer.jsx",
    "(.*/)?App(.jsx)?$": "<rootDir>/src/__tests__/mocks/App.jsx",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/__tests__/mocks/"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.d.ts",
    "!src/main.jsx",
    "!src/firebase.js",
    "!src/config/firebase.js",
    "!src/__tests__/mocks/**/*",
  ],
  transformIgnorePatterns: ["/node_modules/(?!(@mui|@firebase|firebase)/)"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "!**/__tests__/mocks/**"],
};
