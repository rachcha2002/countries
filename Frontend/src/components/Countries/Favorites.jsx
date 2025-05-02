import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  ArrowBack as ArrowBackIcon,
  LocationCity as LocationCityIcon,
  Public as RegionIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const Favorites = () => {
  const { user, favorites, toggleFavorite } = useAuth();
  const [favoriteCountries, setFavoriteCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if user is logged in and has favorites
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchFavoriteCountries = async () => {
      try {
        setLoading(true);

        // Only proceed if there are favorites to fetch
        if (favorites.size === 0) {
          setFavoriteCountries([]);
          setLoading(false);
          return;
        }

        // Convert Set to array and join with commas for the API request
        const favoritesArray = Array.from(favorites);
        const response = await axios.get(
          `https://restcountries.com/v3.1/alpha?codes=${favoritesArray.join(
            ","
          )}`
        );

        setFavoriteCountries(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching favorite countries:", error);
        setError(
          "Failed to fetch your favorite countries. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchFavoriteCountries();
  }, [user, favorites]);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Please sign in to view your favorite countries.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h1">Your Favorite Countries</Typography>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to All Countries
          </Button>
        </Box>

        {favoriteCountries.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h3" gutterBottom>
              You haven't added any favorites yet
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Explore countries and click the heart icon to add them to your
              favorites
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              color="primary"
              size="large"
            >
              Explore Countries
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {favoriteCountries.map((country, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={country.cca3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      component={Link}
                      to={`/country/${country.cca3}`}
                      sx={{
                        height: "100%",
                        textDecoration: "none",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover .country-image": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(country.cca3);
                        }}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                      >
                        <FavoriteIcon color="error" />
                      </IconButton>

                      <CardMedia
                        component="img"
                        height="160"
                        image={country.flags.svg}
                        alt={`${country.name.common} flag`}
                        className="country-image"
                        sx={{
                          transition: "transform 0.3s ease",
                          objectFit: "cover",
                          aspectRatio: "16/9",
                          height: "160px",
                          width: "100%",
                        }}
                      />
                      <CardContent>
                        <Typography
                          variant="h3"
                          component="h2"
                          gutterBottom
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {country.name.common}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {country.population.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <RegionIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {country.region}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocationCityIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {country.capital?.[0] || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </motion.div>
    </Container>
  );
};

export default Favorites;
