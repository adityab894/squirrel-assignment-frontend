import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  maxWidth: '700px',
};

const center = {
  lat: 12.9352, // Default to Bangalore
  lng: 77.6245,
};

function DoctorForm() {
  const [name, setName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [marker, setMarker] = useState(null);
  const [message, setMessage] = useState('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const onMapClick = useCallback((e) => {
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !clinicAddress || !marker) {
      setMessage('Please fill all fields and select a location on the map.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          clinicAddress,
          latitude: marker.lat,
          longitude: marker.lng,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Doctor saved!');
        setName('');
        setClinicAddress('');
        setMarker(null);
      } else {
        setMessage(data.error || 'Error saving doctor');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ textAlign: 'center' }}>Add Clinic Location</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Name:</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={{ flex: 2 }}>
            <label>Clinic Address:</label>
            <input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} required />
          </div>
        </div>
        <div style={{ width: '100%', margin: '16px 0', maxWidth: 700 }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={marker || center}
              zoom={marker ? 16 : 12}
              onClick={onMapClick}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
          ) : (
            <div>Loading Map...</div>
          )}
        </div>
        <button type="submit" style={{ width: 200, marginTop: 16 }}>Save Clinic</button>
      </form>
      {message && <p style={{ marginTop: 16, color: '#1976d2' }}>{message}</p>}
    </div>
  );
}

export default DoctorForm; 