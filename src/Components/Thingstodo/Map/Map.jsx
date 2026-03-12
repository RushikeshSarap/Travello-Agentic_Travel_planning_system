import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Spinner, useMediaQuery } from '@chakra-ui/react';
import axios from 'axios';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const parkingIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2892/2892672.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

// Component to handle map center updates
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
}

const Map = ({ coordinates }) => {
    const [isDesktop] = useMediaQuery('(min-width: 600px)');
    const [parking, setParking] = useState([]);
    const defaultCenter = coordinates ? [coordinates.lat, coordinates.lng] : [20.5937, 78.9629];
    const zoom = 13;

    const fetchParking = async (coords) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/location/nearby-parking?lat=${coords.lat}&lng=${coords.lng}`);
            setParking(response.data.results || []);
        } catch (error) {
            console.error("Error fetching parking", error);
        }
    };

    useEffect(() => {
        if (coordinates && coordinates.lat && coordinates.lng) {
            fetchParking(coordinates);
        }
    }, [coordinates]);

    return (
        <Box height="100%" width="100%" borderRadius="lg" overflow="hidden">
            <MapContainer 
                center={defaultCenter} 
                zoom={zoom} 
                style={{ height: '100%', width: '100%' }}
            >
                <ChangeView center={defaultCenter} zoom={zoom} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Main Location Marker */}
                {coordinates && (
                    <Marker position={[coordinates.lat, coordinates.lng]}>
                        <Popup>Main Location</Popup>
                    </Marker>
                )}

                {/* Parking Markers */}
                {parking.map((p, i) => (
                    <Marker 
                        key={`parking-${i}`} 
                        position={[p.geometry.location.lat, p.geometry.location.lng]}
                        icon={parkingIcon}
                    >
                        <Popup>{p.name}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Box>
    );
};

export default Map;
