import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleMapView = ({ country }) => {
  if (!country || !country.latlng || country.latlng.length !== 2) {
    return (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography>Map data not available for this country</Typography>
      </Box>
    );
  }

  const center = {
    lat: country.latlng[0],
    lng: country.latlng[1],
  };

  // Inside GoogleMapView.jsx
  const mapOptions = {
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    styles: [
      {
        featureType: "administrative.country",
        elementType: "geometry.stroke",
        stylers: [{ color: "#ff0000" }, { weight: 2 }],
      },
      // Add more styling as needed
    ],
  };

  // Then in the GoogleMap component:
  <GoogleMap
    mapContainerStyle={containerStyle}
    center={center}
    zoom={4}
    options={mapOptions}
  >
    <Marker position={center} title={country.name.common} />
  </GoogleMap>;

  return (
    <Paper
      elevation={3}
      sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={4}
        options={{
          fullscreenControl: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
        }}
      >
        <Marker position={center} title={country.name.common} />
      </GoogleMap>
    </Paper>
  );
};

export default React.memo(GoogleMapView);
