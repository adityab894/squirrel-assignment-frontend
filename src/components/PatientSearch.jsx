import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  maxWidth: '700px',
};

const center = {
  lat: 18.520430,
  lng: 73.856743,
};

function PatientSearch() {
  const [marker, setMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const onMapClick = useCallback((e) => {
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
    setMapCenter({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMapCenter({ lat, lng });
      setMarker({ lat, lng });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!marker) {
      setMessage('Please select a location on the map or search for an address.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(
        `http://localhost:5000/api/doctors/search?latitude=${marker.lat}&longitude=${marker.lng}&distance=5000`
      );
      const data = await res.json();
      if (res.ok) {
        setDoctors(data);
        if (data.length === 0) setMessage('No doctors found nearby.');
      } else {
        setMessage(data.error || 'Error searching for doctors');
      }
    } catch (err) {
      setMessage('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ textAlign: 'center' }}>Find Doctors Near You</h2>
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 500, marginBottom: 16 }}>
          {isLoaded && (
            <Autocomplete
              onLoad={autocomplete => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Type an address or area..."
                style={{ width: '100%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </Autocomplete>
          )}
        </div>
        <div style={{ width: '100%', margin: '16px 0', maxWidth: 700, display: 'flex', justifyContent: 'center' }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={marker ? 15 : 12}
              onClick={onMapClick}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
          ) : (
            <div>Loading Map...</div>
          )}
        </div>
        <button type="submit" disabled={loading} style={{ width: 200, marginTop: 16, alignSelf: 'center' }}>
          {loading ? 'Searching...' : 'Search Doctors'}
        </button>
      </form>
      {message && <p style={{ marginTop: 16, color: '#d32f2f' }}>{message}</p>}
      {doctors.length > 0 && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 600 }}>
          <h3>Nearby Doctors:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {doctors.map((doc) => (
              <li key={doc._id} style={{ marginBottom: 12, padding: 12, border: '1px solid #eee', borderRadius: 6, background: '#fafafa' }}>
                <strong>{doc.name}</strong> — {doc.clinicAddress}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PatientSearch; 