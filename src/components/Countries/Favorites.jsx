import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { Favorite as FavoriteIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const Favorites = () => {
  const { user, favorites, toggleFavorite } = useAuth();
  const [favoriteCountries, setFavoriteCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavoriteCountries = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countries = response.data.filter((country) =>
          favorites.has(country.cca3)
        );
        setFavoriteCountries(countries);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching favorite countries:", error);
        setError("Failed to fetch favorite countries. Please try again later.");
        setLoading(false);
      }
    };

    if (user && favorites.size > 0) {
      fetchFavoriteCountries();
    } else {
      setLoading(false);
    }
  }, [favorites, user]);

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

  if (favoriteCountries.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          You haven't added any countries to your favorites yet.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Favorite Countries
      </Typography>
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
                      <Typography variant="body2" color="text.secondary">
                        Population: {country.population.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Region: {country.region}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Capital: {country.capital?.[0] || "N/A"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </Container>
  );
};

export default Favorites;
