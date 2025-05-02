// This should be a mock of App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";

const MockApp = () => {
  return (
    <ThemeProvider theme={{}}>
      <CssBaseline />
      <div data-testid="mock-app">
        <Box sx={{ p: 2, mb: 2 }}>
          <a href="/">Home</a> | <a href="/favorites">Favorites</a>
        </Box>

        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/country/:code" element={<div>Country Detail</div>} />
          <Route path="/favorites" element={<div>Favorites Page</div>} />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default MockApp;
