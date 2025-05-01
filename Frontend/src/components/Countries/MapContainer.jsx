import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useLoadScript } from "@react-google-maps/api";
import GoogleMapView from "./GoogleMapView";

const libraries = ["places"];

const MapContainer = ({ country }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography color="error">
          Error loading Google Maps. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <GoogleMapView country={country} />;
};

export default MapContainer;
