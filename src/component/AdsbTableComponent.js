import React, {useContext} from 'react';
import {AircraftContext} from "../context/AircraftContext";

const AdsbTableComponent = () => {

    const { ADSBVehicles, setADSBVehicles} = useContext(AircraftContext);

    return (
        <table border="1" cellPadding="10" cellSpacing="0" className="table">
            <thead>
            <tr>
                <th>Icao</th>
                <th>Callsign</th>
                <th>Lat</th>
                <th>Lon</th>
                <th>Dir</th>
                <th>TTL</th>
                <th>positionValid</th>
            </tr>
            </thead>
            <tbody>
            {Object.entries(ADSBVehicles).map(([key, value]) => (
                <React.Fragment key={key}>
                    <tr>
                        <td>{value.ICAO}</td>
                        <td>{value.CALL}</td>
                        <td>{value.LAT}</td>
                        <td>{value.LON}</td>
                        <td>{value.TRACK}</td>
                        <td>{value.TTL}</td>
                        <td>{value.positionValid ? 'yes' : 'no'}</td>
                    </tr>
                </React.Fragment>
            ))}
            </tbody>
        </table>
    );
};

export default AdsbTableComponent;
