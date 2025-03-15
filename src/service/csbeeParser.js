import Papa from 'papaparse';
import {
    toLatLon, toLatitudeLongitude, headingDistanceTo, moveTo, insidePolygon
} from 'geolocation-utils'

// Function to parse CSV data
export const parseCsbeeVehiclesData = (csbeeData, ADSBVehicles) => {
    let parsed = Papa.parse(csbeeData, { header: false });
    let vehicleTemplate = {
        ICAO: null,
        FLAGS: null,
        CALL: null,
        SQUAWK: null,
        ECAT: null,
        LAT: null,
        LON: null,
        ALT_BARO: null,
        ALT_GEO: null,
        TRACK: null,
        VELH: null,
        VELV: null,
        SIGS: null,
        SIGQ: null,
        ACFPS: null,
        SFPS: null,
        SYSINFO: null,
        CRC: null,
        TTL: 0,
        history: [],
        extra: [],
        positionValid: false,
    };

    let vehicles = {};
    if(parsed.data.length === 1){
        parsed.data.map(function(row){
            if(row.length === 0){
                console.error("Broken vehicle frame")
                return;
            }

            //detect frame type
            let [header, icao] = row[0].split(':')
            if(header === '#A'){
                const icaoKey = 'K_'+icao;
                const vehicle = ADSBVehicles[icaoKey] === undefined ? {...vehicleTemplate} : ADSBVehicles[icaoKey];

                //detected vehicle frame
                vehicle.ICAO        = icao;
                vehicle.FLAGS       = parseInt(row[1], 16);
                vehicle.CALL        = row[2];
                vehicle.SQUAWK      = row[3];
                vehicle.ECAT        = row[4];
                vehicle.LAT         = parseFloat(row[5]);
                vehicle.LON         = parseFloat(row[6]);
                vehicle.ALT_BARO    = row[7];
                vehicle.ALT_GEO     = row[8];
                vehicle.TRACK       = row[9];
                vehicle.VELH        = parseInt(row[10]);
                vehicle.VELV        = row[11];
                vehicle.SIGS        = row[12];
                vehicle.SIGQ        = row[13];
                vehicle.SFPS        = row[14];
                vehicle.ESFPS       = row[15];
                vehicle.SYSINFO     = row[16];
                vehicle.TTL         = 0;
                vehicle.FTIME       = row[17];

                const date = new Date();
                if(isPositionValid(vehicle.FLAGS)){
                    ///
                    const lastExtraDataRecord = getLastItemFromExtraData(vehicle);

                    //vehicle is new, need to confirm position
                    if(lastExtraDataRecord == null){
                        vehicle.positionValid = false;
                        vehicle.extra.push([vehicle.LAT, vehicle.LON]);
                        vehicles[icaoKey] = vehicle;
                        return vehicles;
                    }

                    //vehicle is not new, check if new position is OK
                    var positionFilterOk = false;
                    if(!isPositionMatch([vehicle.LAT, vehicle.LON], [lastExtraDataRecord[0], lastExtraDataRecord[1]])){
                        //use filter
                        const timeDiff = (date.getTime() - lastExtraDataRecord[2]) / 1000;
                        const distanceDiff = headingDistanceTo([vehicle.LAT, vehicle.LON], [lastExtraDataRecord[0], lastExtraDataRecord[1]]).distance; //distance in meters
                        const speed = isHVelicotyValid(vehicle.FLAGS) ? vehicle.VELH * 0.514444 : 257; // if speed is known, convert speed to m/s, or use default value 500kt = 257m/s
                        const maxPossibleDistance = (timeDiff * speed) * 4; //

                        if(maxPossibleDistance > distanceDiff){
                            positionFilterOk = true;
                            vehicle.positionFilterOk = true;
                        }

                        if(positionFilterOk){
                            vehicle.positionValid = true;
                        }

                        if(!positionFilterOk){
                            vehicle.positionValid = false;
                        }

                        vehicle.history.push([vehicle.LAT, vehicle.LON]);
                        vehicle.extra.push([vehicle.LAT, vehicle.LON, date.getTime(), vehicle.positionValid]);
                    }
                }
                console.log(vehicle);
                vehicles[icaoKey] = vehicle;
            }
        })
    }

    return vehicles;
};


export const isPositionValid = function (flag){
    return flag & 0b00001000;
}

export const isHVelicotyValid = function (flag){
    return flag & 0b00100000;
}


export const getLastItemFromExtraData = function (vehicle){
    if(vehicle.extra.length === 0){
        return null;
    }

    return vehicle.extra[vehicle.extra.length - 1];
}

export const isPositionMatch = function (position1, position2){
    return JSON.stringify(position1) ==  JSON.stringify(position2);
}

