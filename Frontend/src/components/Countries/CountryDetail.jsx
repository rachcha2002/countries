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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  Language as LanguageIcon,
  CurrencyExchange as CurrencyIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";

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

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "calc(100vh - 64px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 4 }}
        >
          Back
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                borderRadius: 3,
                position: "relative",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.paper",
                minHeight: "300px",
              }}
            >
              <Box
                component="img"
                src={country.flags.svg}
                alt={`${country.name.common} flag`}
                sx={{
                  width: "100%",
                  height: "300px",
                  objectFit: "contain",
                  backgroundColor: "background.paper",
                  p: 2,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <IconButton
                onClick={() => toggleFavorite(country.cca3)}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                <FavoriteIcon
                  color={favorites.has(country.cca3) ? "error" : "action"}
                />
              </IconButton>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box sx={{ height: "100%" }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h1" gutterBottom>
                  {country.name.common}
                </Typography>
                <Typography variant="h2" color="text.secondary" gutterBottom>
                  {country.name.official}
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Native Name:</strong>{" "}
                      {Object.values(country.name.nativeName)[0]?.common ||
                        "N/A"}
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

                <Grid item xs={12} sm={6}>
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
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default CountryDetail;
