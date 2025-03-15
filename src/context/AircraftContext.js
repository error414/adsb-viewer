import React, {createContext, useState} from "react";

export const AircraftContext = createContext({
    ADSBVehicles: [],
});

const AircraftProvider = ({ children }) => {
    const [ADSBVehicles, setADSBVehicles] = useState({});

    return (
        <AircraftContext.Provider value={{ ADSBVehicles, setADSBVehicles }}>
            {children}
        </AircraftContext.Provider>
    );
}

export default AircraftProvider;