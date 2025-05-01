import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  Box,
  Container,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();
  const { user, signIn, signOut, error, loading } = useAuth();

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 0 } }}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h1"
              component={Link}
              to="/"
              sx={{
                fontSize: { xs: "1rem", sm: "1.5rem" },
                fontWeight: 800,
                color: "inherit",
                textDecoration: "none",
                "&:hover": {
                  color: theme.palette.secondary.main,
                },
              }}
            >
              Where in the world?
            </Typography>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={handleThemeToggle}
                color="inherit"
                sx={{
                  "&:hover": {
                    color: theme.palette.secondary.main,
                  },
                }}
              >
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
              <Typography
                variant="body1"
                sx={{
                  ml: 1,
                  fontWeight: 600,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: 700,
              }}
            >
              Countries
            </Typography>
            {user && (
              <Typography
                variant="body1"
                component={Link}
                to="/favorites"
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Favorites
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {loading ? (
              <CircularProgress size={24} />
            ) : user ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  variant="outlined"
                  onClick={signOut}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                  }}
                >
                  Sign Out
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  variant="contained"
                  onClick={signIn}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                  }}
                >
                  Sign In
                </Button>
              </motion.div>
            )}
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 1,
              }}
            >
              {error}
            </Alert>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
