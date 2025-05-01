import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Chip,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  Language as LanguageIcon,
  CurrencyExchange as CurrencyIcon,
  LocationOn as LocationIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import GoogleMapView from "./GoogleMapView"; // Import the new component
import MapContainer from "./MapContainer";

const CountryDetail = ({ favorites, toggleFavorite, darkMode }) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [country, setCountry] = useState(null);
  const [borderCountries, setBorderCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://restcountries.com/v3.1/alpha/${code}`
        );
        const countryData = response.data[0];
        setCountry(countryData);

        if (countryData.borders && countryData.borders.length > 0) {
          const borderResponse = await axios.get(
            `https://restcountries.com/v3.1/alpha?codes=${countryData.borders.join(
              ","
            )}`
          );
          setBorderCountries(borderResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching country details:", error);
        setError("Failed to fetch country details. Please try again later.");
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [code]);

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

  if (!country) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Country not found</Alert>
      </Container>
    );
  }

  // Mobile layout remains the same (vertically stacked)
  if (isMobile) {
    return (
      <Container maxWidth="xl" sx={{ py: 2, minHeight: "calc(100vh - 64px)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
            size="small"
          >
            Back
          </Button>

          <Grid container spacing={2}>
            {/* Country Details */}
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h1" gutterBottom>
                  {country.name.common}
                </Typography>
                <Typography variant="h2" color="text.secondary" gutterBottom>
                  {country.name.official}
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Native Name:</strong>{" "}
                      {Object.values(country.name.nativeName || {})[0]
                        ?.common || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Population:</strong>{" "}
                      {country.population.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Region:</strong> {country.region || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Sub Region:</strong> {country.subregion || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Capital:</strong> {country.capital?.[0] || "N/A"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Top Level Domain:</strong>{" "}
                      {country.tld?.join(", ") || "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Currencies:</strong>{" "}
                      {country.currencies
                        ? Object.values(country.currencies)
                            .map((currency) => currency.name)
                            .join(", ")
                        : "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Languages:</strong>{" "}
                      {country.languages
                        ? Object.values(country.languages).join(", ")
                        : "N/A"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Coordinates:</strong>{" "}
                      {country.latlng
                        ? `${country.latlng[0]}, ${country.latlng[1]}`
                        : "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {borderCountries.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h3" gutterBottom>
                    Border Countries:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {borderCountries.map((border) => (
                      <Chip
                        key={border.cca3}
                        label={border.name.common}
                        component={Link}
                        to={`/country/${border.cca3}`}
                        clickable
                        sx={{
                          "&:hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Flag */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  overflow: "hidden",
                  borderRadius: 2,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "background.paper",
                  height: "280px", // Fixed height for consistency
                  width: "100%",
                  mb: 2,
                }}
              >
                <Box
                  component="img"
                  src={country.flags.svg}
                  alt={`${country.name.common} flag`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain", // Ensures flag maintains aspect ratio
                    backgroundColor: "background.paper",
                    p: 1,
                    borderRadius: 1,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                />
                <IconButton
                  onClick={() => toggleFavorite(country.cca3)}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                >
                  <FavoriteIcon
                    color={favorites.has(country.cca3) ? "error" : "action"}
                    fontSize="small"
                  />
                </IconButton>
              </Paper>
            </Grid>

            {/* Map */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <MapIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="h3" fontSize="1.25rem">
                  Location on Map
                </Typography>
              </Box>
              <Paper
                elevation={0}
                sx={{
                  overflow: "hidden",
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                  height: "280px", // Fixed height to match flag
                  width: "100%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <Box sx={{ height: "100%", width: "100%" }}>
                  <MapContainer country={country} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    );
  }

  // Desktop layout - Details on left, Flag and Map on right
  return (
    <Container maxWidth="xl" sx={{ py: 2, minHeight: "calc(100vh - 64px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Grid container spacing={2}>
          {/* LEFT SIDE - Country Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h1" gutterBottom sx={{ mb: 1 }}>
                {country.name.common}
              </Typography>
              <Typography
                variant="h2"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 1 }}
              >
                {country.name.official}
              </Typography>
            </Box>

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Native Name:</strong>{" "}
                    {Object.values(country.name.nativeName || {})[0]?.common ||
                      "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Population:</strong>{" "}
                    {country.population.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Region:</strong> {country.region || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Sub Region:</strong> {country.subregion || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Capital:</strong> {country.capital?.[0] || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Top Level Domain:</strong>{" "}
                    {country.tld?.join(", ") || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Currencies:</strong>{" "}
                    {country.currencies
                      ? Object.values(country.currencies)
                          .map((currency) => currency.name)
                          .join(", ")
                      : "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Languages:</strong>{" "}
                    {country.languages
                      ? Object.values(country.languages).join(", ")
                      : "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    <strong>Coordinates:</strong>{" "}
                    {country.latlng
                      ? `${country.latlng[0]}, ${country.latlng[1]}`
                      : "N/A"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {borderCountries.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
                  Border Countries:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {borderCountries.map((border) => (
                    <Chip
                      key={border.cca3}
                      label={border.name.common}
                      component={Link}
                      to={`/country/${border.cca3}`}
                      clickable
                      size="small"
                      sx={{
                        "&:hover": {
                          transform: "translateY(-2px)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Grid>

          {/* RIGHT SIDE - Flag and Map */}
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={1}>
              {/* Flag */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    overflow: "hidden",
                    borderRadius: 2,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.paper",
                    height: "280px", // Fixed height for consistency
                    width: "100%",
                  }}
                >
                  <Box
                    component="img"
                    src={country.flags.svg}
                    alt={`${country.name.common} flag`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // Ensures flag maintains aspect ratio
                      backgroundColor: "background.paper",
                      p: 1,
                      borderRadius: 1,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  />
                  <IconButton
                    onClick={() => toggleFavorite(country.cca3)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                  >
                    <FavoriteIcon
                      color={favorites.has(country.cca3) ? "error" : "action"}
                      fontSize="small"
                    />
                  </IconButton>
                </Paper>
              </Grid>

              {/* Map */}
              <Grid item xs={12}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <MapIcon sx={{ mr: 1 }} fontSize="small" />
                    <Typography variant="h3" fontSize="1.25rem">
                      Location on Map
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      overflow: "hidden",
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      height: "280px", // Fixed height to match flag
                      width: "100%",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box sx={{ height: "100%", width: "100%" }}>
                      <MapContainer country={country} />
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default CountryDetail;
