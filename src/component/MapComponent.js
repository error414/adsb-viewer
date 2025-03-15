import React, {useEffect, useState, useRef, useContext} from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {AircraftContext} from '../context/AircraftContext';
import {getAdsbVehicleType} from '../service/adsbAircraftIcon';

const MoveMapToLocation = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            // Move the map to the current position
            map.setView(position, 13); // Set new center and zoom level (13)
        }
    }, [position, map]);

    return null;
};

const MapComponent = ({  }) => {
    const zoom = 13; // Set the zoom level
    const [location, setLocation] = useState([51.505, -0.09]);
    const position = [51.505, -0.09];
    const { ADSBVehicles, setADSBVehicles} = useContext(AircraftContext);

    const markers = [];
    Object.entries(ADSBVehicles).map(([icao, vehicle]) => {
        if(vehicle.LAT !== undefined && vehicle.LON !== undefined && vehicle.TRACK !== undefined && vehicle.FLAGS & 0x08) {
            if(vehicle.TTL > 60)
            {
               // return;
            }

            const vehicleTypeIcon = getAdsbVehicleType(vehicle.ECAT);
            const icon = new L.DivIcon({
                html: `<img src='./img/${vehicleTypeIcon.icon}' width='20' height='20' style='color: green; transition: all 1s; transform: rotate(${vehicle.TRACK}deg)' />`,
                className: 'leaflet-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -20],
            });

            markers.push({
                location: [vehicle.LAT, vehicle.LON],
                icon: icon,
                call: vehicle.CALL,
                iaco: vehicle.ICAO,
                name: vehicleTypeIcon.name,
                altBaro: vehicle.ALT_BARO,
                altGeo: vehicle.ALT_GEO,
                ttl: vehicle.TTL,
                history: [...vehicle.history],
            });
        }
    });

    useEffect(() => {
        // Get the user's current position using geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }, []);

    return (
        <MapContainer center={position} zoom={zoom} style={{ width: '100%', height: '100%' }}>
            <MoveMapToLocation position={location} />

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // You can change the tile layer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {Object.entries(markers).map(([key, value]) => (
                <React.Fragment key={key}>
                    <Polyline positions={value.history} />
                    <Marker position={value.location} icon={value.icon}>
                        <Popup>
                            <table className="table">
                                <tbody>
                                <tr>
                                    <th>Call:</th>
                                    <td>{value.call}</td>
                                </tr>
                                <tr>
                                    <th>ICAO:</th>
                                    <td>{value.iaco}</td>
                                </tr>
                                <tr>
                                    <th>Lat:</th>
                                    <td>{value.location[0]}</td>
                                </tr>
                                <tr>
                                    <th>Lon:</th>
                                    <td>{value.location[1]}</td>
                                </tr>
                                <tr>
                                    <th>Altitude baro:</th>
                                    <td>{value.altBaro} ft</td>
                                </tr>
                                <tr>
                                    <th>Altitude geo:</th>
                                    <td>{value.altGeo} ft</td>
                                </tr>
                                <tr>
                                    <th>Type:</th>
                                    <td>{value.name}</td>
                                </tr>
                                <tr>
                                    <th>TTL:</th>
                                    <td>{value.ttl}</td>
                                </tr>
                                </tbody>
                            </table>
                        </Popup>
                    </Marker>
                </React.Fragment>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
