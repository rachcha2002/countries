import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  MenuItem,
  Box,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Pagination,
  Chip,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Favorite as FavoriteIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Language as LanguageIcon,
  People as PeopleIcon,
  LocationCity as LocationCityIcon,
  AttachMoney as CurrencyIcon,
  Public as RegionIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const regions = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
const itemsPerPage = 12;

const Home = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [searchByNameActive, setSearchByNameActive] = useState(false);
  const { user, favorites, toggleFavorite } = useAuth();

  // Fetch all countries initially
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        setLoading(true);
        console.log("Fetching all countries from API...");
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const sortedCountries = response.data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);

        // Extract unique languages
        const uniqueLanguages = new Set();
        sortedCountries.forEach((country) => {
          if (country.languages) {
            Object.values(country.languages).forEach((lang) =>
              uniqueLanguages.add(lang)
            );
          }
        });
        setLanguages(Array.from(uniqueLanguages).sort());

        // Extract unique currencies
        const uniqueCurrencies = new Set();
        sortedCountries.forEach((country) => {
          if (country.currencies) {
            Object.keys(country.currencies).forEach((code) =>
              uniqueCurrencies.add(code)
            );
          }
        });
        setCurrencies(Array.from(uniqueCurrencies).sort());

        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setError("Failed to fetch countries. Please try again later.");
        setLoading(false);
      }
    };

    fetchAllCountries();
  }, []);

  // Search by name API endpoint
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      const fetchCountriesByName = async () => {
        try {
          setLoading(true);
          setSearchByNameActive(true);
          console.log(`Searching countries by name: ${searchQuery}`);

          const response = await axios.get(
            `https://restcountries.com/v3.1/name/${searchQuery}`
          );
          console.log(
            `Found ${response.data.length} countries matching "${searchQuery}"`
          );

          // Apply other filters client-side if needed
          let results = response.data;

          if (selectedRegion) {
            results = results.filter(
              (country) => country.region === selectedRegion
            );
          }

          if (selectedLanguage) {
            results = results.filter(
              (country) =>
                country.languages &&
                Object.values(country.languages).includes(selectedLanguage)
            );
          }

          if (selectedCurrency) {
            results = results.filter(
              (country) =>
                country.currencies &&
                Object.keys(country.currencies).includes(selectedCurrency)
            );
          }

          // Apply sorting
          results.sort((a, b) => {
            switch (sortBy) {
              case "name":
                return a.name.common.localeCompare(b.name.common);
              case "population":
                return b.population - a.population;
              case "area":
                return (b.area || 0) - (a.area || 0);
              default:
                return 0;
            }
          });

          setFilteredCountries(results);
          setLoading(false);
        } catch (error) {
          console.error("Error searching countries by name:", error);
          // Fallback to client-side filtering if API call fails
          setSearchByNameActive(false);
          const filtered = countries.filter((country) =>
            country.name.common
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
          setFilteredCountries(filtered);
          setLoading(false);
        }
      };

      const timer = setTimeout(() => {
        fetchCountriesByName();
      }, 500); // Debounce search for better UX

      return () => clearTimeout(timer);
    } else if (searchQuery === "") {
      setSearchByNameActive(false);
    }
  }, [searchQuery]);

  // Region filter API endpoint
  useEffect(() => {
    if (selectedRegion && !searchByNameActive) {
      const fetchCountriesByRegion = async () => {
        try {
          setLoading(true);
          console.log(`Fetching countries in region: ${selectedRegion}`);

          const response = await axios.get(
            `https://restcountries.com/v3.1/region/${selectedRegion}`
          );
          console.log(
            `Found ${response.data.length} countries in ${selectedRegion}`
          );

          // Apply other filters client-side if needed
          let results = response.data;

          if (selectedLanguage) {
            results = results.filter(
              (country) =>
                country.languages &&
                Object.values(country.languages).includes(selectedLanguage)
            );
          }

          if (selectedCurrency) {
            results = results.filter(
              (country) =>
                country.currencies &&
                Object.keys(country.currencies).includes(selectedCurrency)
            );
          }

          // Apply sorting
          results.sort((a, b) => {
            switch (sortBy) {
              case "name":
                return a.name.common.localeCompare(b.name.common);
              case "population":
                return b.population - a.population;
              case "area":
                return (b.area || 0) - (a.area || 0);
              default:
                return 0;
            }
          });

          setFilteredCountries(results);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching countries by region:", error);
          // Fallback to client-side filtering
          const filtered = countries.filter(
            (country) => country.region === selectedRegion
          );
          setFilteredCountries(filtered);
          setLoading(false);
        }
      };

      fetchCountriesByRegion();
    }
  }, [selectedRegion, searchByNameActive]);

  // Language filter API endpoint
  useEffect(() => {
    if (selectedLanguage && !searchByNameActive && !selectedRegion) {
      const fetchCountriesByLanguage = async () => {
        try {
          setLoading(true);
          console.log(`Fetching countries with language: ${selectedLanguage}`);

          const response = await axios.get(
            `https://restcountries.com/v3.1/lang/${encodeURIComponent(
              selectedLanguage
            )}`
          );
          console.log(
            `Found ${response.data.length} countries speaking ${selectedLanguage}`
          );

          // Apply other filters client-side if needed
          let results = response.data;

          if (selectedCurrency) {
            results = results.filter(
              (country) =>
                country.currencies &&
                Object.keys(country.currencies).includes(selectedCurrency)
            );
          }

          // Apply sorting
          results.sort((a, b) => {
            switch (sortBy) {
              case "name":
                return a.name.common.localeCompare(b.name.common);
              case "population":
                return b.population - a.population;
              case "area":
                return (b.area || 0) - (a.area || 0);
              default:
                return 0;
            }
          });

          setFilteredCountries(results);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching countries by language:", error);
          // Fallback to client-side filtering
          const filtered = countries.filter(
            (country) =>
              country.languages &&
              Object.values(country.languages).includes(selectedLanguage)
          );
          setFilteredCountries(filtered);
          setLoading(false);
        }
      };

      fetchCountriesByLanguage();
    }
  }, [selectedLanguage, searchByNameActive, selectedRegion]);

  // Currency filter API endpoint
  useEffect(() => {
    if (
      selectedCurrency &&
      !searchByNameActive &&
      !selectedRegion &&
      !selectedLanguage
    ) {
      const fetchCountriesByCurrency = async () => {
        try {
          setLoading(true);
          console.log(`Fetching countries with currency: ${selectedCurrency}`);

          const response = await axios.get(
            `https://restcountries.com/v3.1/currency/${selectedCurrency}`
          );
          console.log(
            `Found ${response.data.length} countries using ${selectedCurrency}`
          );

          // Apply sorting
          let results = response.data;
          results.sort((a, b) => {
            switch (sortBy) {
              case "name":
                return a.name.common.localeCompare(b.name.common);
              case "population":
                return b.population - a.population;
              case "area":
                return (b.area || 0) - (a.area || 0);
              default:
                return 0;
            }
          });

          setFilteredCountries(results);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching countries by currency:", error);
          // Fallback to client-side filtering
          const filtered = countries.filter(
            (country) =>
              country.currencies &&
              Object.keys(country.currencies).includes(selectedCurrency)
          );
          setFilteredCountries(filtered);
          setLoading(false);
        }
      };

      fetchCountriesByCurrency();
    }
  }, [selectedCurrency, searchByNameActive, selectedRegion, selectedLanguage]);

  // Default client-side filtering when no specific API is used
  useEffect(() => {
    if (
      !searchByNameActive &&
      !selectedRegion &&
      !selectedLanguage &&
      !selectedCurrency
    ) {
      let filtered = [...countries];

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.common.localeCompare(b.name.common);
          case "population":
            return b.population - a.population;
          case "area":
            return (b.area || 0) - (a.area || 0);
          default:
            return 0;
        }
      });

      setFilteredCountries(filtered);
      setCurrentPage(1);
    }
  }, [
    sortBy,
    countries,
    searchByNameActive,
    selectedRegion,
    selectedLanguage,
    selectedCurrency,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("");
    setSelectedLanguage("");
    setSelectedCurrency("");
    setSearchByNameActive(false);
    setSortBy("name");
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCountries.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);

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
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {user && (
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Welcome, {user.name}! Explore countries around the world.
        </Typography>
      )}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 3,
          background: "linear-gradient(45deg, #2B3945 30%, #3B4B58 90%)",
          color: "white",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Explore the World
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Discover information about countries around the globe
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search for a country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "300px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 0.7,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 0.7,
              },
            }}
            displayEmpty
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <RegionIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">
              <em>All Regions</em>
            </MenuItem>
            {regions.map((region) => (
              <MenuItem key={region} value={region}>
                {region}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 0.7,
              },
            }}
            displayEmpty
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">
              <em>All Languages</em>
            </MenuItem>
            {languages.map((language) => (
              <MenuItem key={language} value={language}>
                {language}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 0.7,
              },
            }}
            displayEmpty
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">
              <em>All Currencies</em>
            </MenuItem>
            {currencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 0.7,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="name">Sort by Name</MenuItem>
            <MenuItem value="population">Sort by Population</MenuItem>
            <MenuItem value="area">Sort by Area</MenuItem>
          </TextField>
        </Box>

        {(searchQuery ||
          selectedRegion ||
          selectedLanguage ||
          selectedCurrency) && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleResetFilters}
              startIcon={<FilterIcon />}
            >
              Reset Filters
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" align="center">
            Found {filteredCountries.length} countries
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedRegion && ` in ${selectedRegion}`}
            {selectedLanguage && ` speaking ${selectedLanguage}`}
            {selectedCurrency && ` using ${selectedCurrency}`}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab
            value="grid"
            label="Grid View"
            icon={<GridViewIcon />}
            iconPosition="start"
          />
          <Tab
            value="list"
            label="List View"
            icon={<ViewListIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {viewMode === "grid" ? (
        <Grid container spacing={3}>
          <AnimatePresence>
            {currentItems.map((country, index) => (
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
                    data-testid={`country-card-${country.cca3}`}
                  >
                    {user && (
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
                        data-testid={`favorite-button-${country.cca3}`}
                      >
                        <FavoriteIcon
                          color={
                            favorites.has(country.cca3) ? "error" : "action"
                          }
                        />
                      </IconButton>
                    )}

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
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {country.population.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <RegionIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {country.region}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationCityIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {country.capital?.[0] || "N/A"}
                          </Typography>
                        </Box>
                        {country.currencies && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CurrencyIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {Object.keys(country.currencies).join(", ")}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AnimatePresence>
            {currentItems.map((country, index) => (
              <motion.div
                key={country.cca3}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  component={Link}
                  to={`/country/${country.cca3}`}
                  sx={{
                    display: "flex",
                    textDecoration: "none",
                    "&:hover": {
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 200, height: 120 }}
                    image={country.flags.svg}
                    alt={`${country.name.common} flag`}
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="h3" component="h2" gutterBottom>
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
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
                              <LocationCityIcon
                                fontSize="small"
                                color="action"
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {country.capital?.[0] || "N/A"}
                              </Typography>
                            </Box>
                            {country.currencies && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <CurrencyIcon fontSize="small" color="action" />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {Object.keys(country.currencies).join(", ")}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        {user && (
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(country.cca3);
                            }}
                          >
                            <FavoriteIcon
                              color={
                                favorites.has(country.cca3) ? "error" : "action"
                              }
                            />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {filteredCountries.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Alert severity="info" sx={{ display: "inline-flex", mb: 2 }}>
            No countries found with the current filters
          </Alert>
          <Typography variant="body1">
            Try adjusting your search criteria or resetting the filters.
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default Home;
