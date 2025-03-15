import React, {useContext, useEffect, useRef} from "react";
import {AircraftContext} from "../context/AircraftContext";

const HighPriorityIntervalComponent = () => {
    const intervalRef = useRef(null);
    const { ADSBVehicles, setADSBVehicles} = useContext(AircraftContext);

    useEffect(() => {
        // This function will be executed in high priority
        const runHighPriorityTask = () => {
            setADSBVehicles(function(prevADSBVehiclesTemp){
                Object.entries(prevADSBVehiclesTemp).map(function([icao, ADSBVehicle]){
                    ADSBVehicle.TTL++;
                });

                return prevADSBVehiclesTemp;
            });
        };

        // Set the interval to run at regular intervals
        intervalRef.current = setInterval(runHighPriorityTask, 1000); // Runs every second

        // Cleanup when the component unmounts
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div>
        </div>
    );
};

export default HighPriorityIntervalComponent;