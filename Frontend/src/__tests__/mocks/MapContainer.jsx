// Mock for MapContainer component
import React from "react";

const MapContainer = ({ country }) => {
  return (
    <div data-testid="map-container" className="map-container">
      <h3>Map Container (Mock)</h3>
      <p>Country: {country?.name?.common}</p>
      <p>
        Coordinates: {country?.latlng?.[0]}, {country?.latlng?.[1]}
      </p>
    </div>
  );
};

export default MapContainer;
