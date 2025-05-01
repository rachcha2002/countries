import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import {
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import Home from "./components/Countries/Home";
import CountryDetail from "./components/Countries/CountryDetail";
import Favorites from "./components/Countries/Favorites";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, signIn, signOut, favorites, toggleFavorite } = useAuth();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#90caf9" : "#1976d2",
      },
      secondary: {
        main: darkMode ? "#f48fb1" : "#dc004e",
      },
      background: {
        default: darkMode ? "#202C37" : "#FAFAFA",
        paper: darkMode ? "#2B3945" : "#FFFFFF",
      },
      text: {
        primary: darkMode ? "#FFFFFF" : "#111517",
        secondary: darkMode ? "#858585" : "#858585",
      },
    },
    typography: {
      fontFamily: "'Nunito Sans', sans-serif",
      h1: {
        fontWeight: 800,
        fontSize: "2.5rem",
        "@media (min-width:600px)": {
          fontSize: "3rem",
        },
      },
      h2: {
        fontWeight: 800,
        fontSize: "2rem",
        "@media (min-width:600px)": {
          fontSize: "2.5rem",
        },
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.5rem",
      },
      body1: {
        fontSize: "1rem",
        "@media (min-width:600px)": {
          fontSize: "1.125rem",
        },
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 12,
            padding: "10px 24px",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
            },
          },
        },
      },
    },
  });

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signOut();
    handleClose();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HomeIcon />
              Countries Explorer
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {user && (
                <IconButton
                  component={Link}
                  to="/favorites"
                  color="inherit"
                  sx={{
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
              )}
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                sx={{
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton
                onClick={handleMenu}
                color="inherit"
                sx={{
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {user ? (
                  <Avatar
                    src={user.imageUrl}
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountIcon />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {user ? (
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                ) : (
                  <MenuItem onClick={signIn}>Sign In with Google</MenuItem>
                )}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/country/:code"
              element={
                <CountryDetail
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  darkMode={darkMode}
                />
              }
            />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
