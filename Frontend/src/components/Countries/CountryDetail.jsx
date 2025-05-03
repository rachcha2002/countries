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
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  Flag as FlagIcon,
  Info as InfoIcon,
  Map as MapIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import MapContainer from "./MapContainer";

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`country-tabpanel-${index}`}
      aria-labelledby={`country-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Function to get Wikipedia data for a country
const fetchWikipediaData = async (countryName) => {
  try {
    // First, search for the country page
    const searchResponse = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${countryName} country&format=json&origin=*`
    );

    if (searchResponse.data.query.search.length === 0) {
      return { error: "No Wikipedia content found" };
    }

    const pageId = searchResponse.data.query.search[0].pageid;

    // Then, get the page content
    const contentResponse = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${pageId}&format=json&origin=*`
    );

    // Get the full page content for history sections
    const fullContentResponse = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&pageids=${pageId}&format=json&origin=*`
    );

    // Get images from the page (only for history tab)
    const imagesResponse = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=images&format=json&origin=*`
    );

    let images = [];
    if (imagesResponse.data.query.pages[pageId].images) {
      const imageFileNames = imagesResponse.data.query.pages[pageId].images
        .map((img) => img.title)
        .filter(
          (title) =>
            !title.includes("Flag of") &&
            !title.includes("Coat of arms") &&
            !title.includes("Location") &&
            !title.includes("Commons-logo") &&
            !title.includes("Wiki") &&
            !title.includes(".svg") &&
            (title.includes(".jpg") || title.includes(".png"))
        )
        .slice(0, 10);

      // Get image URLs for each file
      for (const fileName of imageFileNames) {
        const imageInfoResponse = await axios.get(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            fileName
          )}&prop=imageinfo&iiprop=url&format=json&origin=*`
        );

        const pages = imageInfoResponse.data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pages[pageId].imageinfo && pages[pageId].imageinfo.length > 0) {
          images.push({
            url: pages[pageId].imageinfo[0].url,
            title: fileName
              .replace("File:", "")
              .replace(/_/g, " ")
              .replace(/\.(jpg|png|gif|jpeg)/i, ""),
          });
        }
      }
    }

    // Extract the history section from the full content
    let historySection = "";
    const fullHtmlContent =
      fullContentResponse.data.query.pages[pageId].extract;

    // Try multiple section heading variations to find history content
    const historyRegexes = [
      /<h2><span id="History">.*?<\/span><\/h2>(.*?)(?:<h2>|$)/s,
      /<h2><span id="Historical_background">.*?<\/span><\/h2>(.*?)(?:<h2>|$)/s,
      /<h3><span id="History">.*?<\/span><\/h3>(.*?)(?:<h[23]>|$)/s,
      /<h2><span id="Early_history">.*?<\/span><\/h2>(.*?)(?:<h2>|$)/s,
    ];

    for (const regex of historyRegexes) {
      const match = fullHtmlContent.match(regex);
      if (match && match[1]) {
        // Clean up the HTML
        historySection = match[1]
          .replace(/<\/?[^>]+(>|$)/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        break;
      }
    }

    // If no specific history section found, try to extract a general history from the intro
    if (!historySection && contentResponse.data.query.pages[pageId].extract) {
      const intro = contentResponse.data.query.pages[pageId].extract;
      if (
        intro.includes("history") ||
        intro.includes("founded") ||
        intro.includes("established") ||
        intro.includes("century")
      ) {
        historySection = "Based on general information: " + intro;
      }
    }

    return {
      summary: contentResponse.data.query.pages[pageId].extract,
      history:
        historySection ||
        "No specific history information available in Wikipedia.",
      images: images,
    };
  } catch (error) {
    console.error("Error fetching Wikipedia data:", error);
    return { error: "Failed to fetch data from Wikipedia" };
  }
};

const CountryDetail = ({ favorites, toggleFavorite, darkMode }) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [country, setCountry] = useState(null);
  const [borderCountries, setBorderCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [wikiData, setWikiData] = useState(null);
  const [wikiLoading, setWikiLoading] = useState(false);
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

        // Once we have the country name, fetch Wikipedia data
        setWikiLoading(true);
        const wikiResult = await fetchWikipediaData(countryData.name.common);
        setWikiData(wikiResult);
        setWikiLoading(false);
      } catch (error) {
        console.error("Error fetching country details:", error);
        setError("Failed to fetch country details. Please try again later.");
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [code]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" gutterBottom>
            {country.name.common}
          </Typography>
          <Typography variant="h2" color="text.secondary" gutterBottom>
            {country.name.official}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "flex-end", mt: 1 }}>
            <IconButton
              onClick={() => toggleFavorite(country.cca3)}
              size="small"
              sx={{
                mr: 1,
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
          </Box>
        </Box>

        {/* Flag and Map Row - MOVED ABOVE TABS as requested */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Flag - LEFT side */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FlagIcon sx={{ mr: 1 }} />
              <Typography variant="h3">Flag</Typography>
            </Box>
            <Paper
              elevation={2}
              sx={{
                overflow: "hidden",
                borderRadius: 2,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.paper",
                height: "300px",
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
                  objectFit: "contain",
                  backgroundColor: "background.paper",
                  p: 1,
                  borderRadius: 1,
                }}
              />
            </Paper>
          </Grid>

          {/* Map - RIGHT side */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <MapIcon sx={{ mr: 1 }} />
              <Typography variant="h3">Location on Map</Typography>
            </Box>
            <Paper
              elevation={2}
              sx={{
                overflow: "hidden",
                borderRadius: 2,
                backgroundColor: "background.paper",
                height: "300px",
                width: "100%",
              }}
            >
              <Box sx={{ height: "100%", width: "100%" }}>
                <MapContainer country={country} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<InfoIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="History" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Country Basic Info */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>
                      <strong>Native Name:</strong>{" "}
                      {Object.values(country.name.nativeName || {})[0]
                        ?.common || "N/A"}
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

              {/* Wikipedia summary */}
              {wikiLoading ? (
                <Box sx={{ textAlign: "center", my: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : wikiData?.summary ? (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h3" gutterBottom>
                    Overview
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: "justify" }}>
                    {wikiData.summary.replace(/<\/?[^>]+(>|$)/g, "")}
                  </Typography>
                </Box>
              ) : null}
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Border countries */}
              {borderCountries.length > 0 && (
                <Box sx={{ mb: 3 }}>
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
          </Grid>
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={tabValue} index={1}>
          {wikiLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h3" gutterBottom>
                  History of {country.name.common}
                </Typography>
                {wikiData?.history &&
                wikiData.history !==
                  "No specific history information available in Wikipedia." ? (
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ textAlign: "justify" }}
                  >
                    {wikiData.history}
                  </Typography>
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Detailed history information is not available from
                      Wikipedia. Below is general information about{" "}
                      {country.name.common}.
                    </Alert>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ textAlign: "justify" }}
                    >
                      {wikiData?.summary?.replace(/<\/?[^>]+(>|$)/g, "") ||
                        `${country.name.common} is a country located in ${
                          country.region || "the world"
                        }. 
                      Its capital is ${
                        country.capital?.[0] || "not specified"
                      } and it has a population of ${country.population.toLocaleString()}.
                      For more detailed historical information, consider visiting the official website of ${
                        country.name.common
                      } or consulting historical resources.`}
                    </Typography>
                  </>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {wikiData?.images && wikiData.images.length > 0 ? (
                  <>
                    <Typography variant="h3" gutterBottom>
                      Historical Images
                    </Typography>
                    {/* Small image grid for history tab */}
                    <ImageList cols={isMobile ? 2 : 3} gap={4} sx={{ mb: 2 }}>
                      {wikiData.images.slice(0, 6).map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={image.url}
                            alt={image.title}
                            loading="lazy"
                            style={{
                              borderRadius: 4,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              maxHeight: "120px",
                            }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </>
                ) : (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h3" gutterBottom>
                      About {country.name.common}
                    </Typography>
                    {/* Small image grid with historical images from Unsplash */}
                    <ImageList cols={isMobile ? 2 : 3} gap={4} sx={{ mb: 2 }}>
                      {[...Array(6)].map((_, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={`https://source.unsplash.com/random/300x200/?${encodeURIComponent(
                              country.name.common
                            )},${
                              index % 2 === 0
                                ? "historical,landmark"
                                : "history,culture"
                            }`}
                            alt={`${country.name.common} historical image ${
                              index + 1
                            }`}
                            loading="lazy"
                            style={{
                              borderRadius: 4,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              maxHeight: "120px",
                            }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </motion.div>
    </Container>
  );
};

export default CountryDetail;
