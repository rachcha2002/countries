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
  Zoom,
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
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const { user, favorites, toggleFavorite } = useAuth();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
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

        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setError("Failed to fetch countries. Please try again later.");
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    let filtered = [...countries];

    if (searchQuery) {
      filtered = filtered.filter((country) =>
        country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter(
        (country) => country.region === selectedRegion
      );
    }

    if (selectedLanguage) {
      filtered = filtered.filter(
        (country) =>
          country.languages &&
          Object.values(country.languages).includes(selectedLanguage)
      );
    }

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
  }, [searchQuery, selectedRegion, selectedLanguage, countries, sortBy]);

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {user && (
        <Typography variant="h5" sx={{ mb: 4, textAlign: "center" }}>
          Welcome, {user.name}! Explore countries around the world.
        </Typography>
      )}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(45deg, #2B3945 30%, #3B4B58 90%)",
          color: "white",
        }}
      >
        <Typography variant="h1" gutterBottom>
          Explore the World
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Discover information about countries around the globe
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search for a country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "300px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
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
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
              },
            }}
            displayEmpty
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon />
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
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
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
                          <LanguageIcon fontSize="small" color="action" />
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
                              <LanguageIcon fontSize="small" color="action" />
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
