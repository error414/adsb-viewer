const ADSB_VEHICLE_TYPE = {
    0: {icon: 'adsb_14.png', name: 'Invalid'},
    1: {icon: 'adsb_14.png', name: 'Reserved'},
    2: {icon: 'adsb_14.png', name: 'No info'},
    3:{icon:  'adsb_9.png', name: 'Surface'},
    4:{icon:  'adsb_10.png', name: 'Service surface'},
    5:{icon:  'adsb_12.png', name: 'Point obstruction'},
    6: {icon: 'adsb_6.png', name: 'Glider / Sailplane'},
    7:{icon:  'adsb_15.png', name: 'Parachute'},
    8:{icon:  'adsb_1.png', name: 'Ultra light'},
    9:{icon:  'adsb_8.png', name: 'UAV'},
    10:{icon:  'adsb_14.png', name: 'Space'},
    11: {icon: 'adsb_1.png', name: 'Light'},
    12: {icon: 'adsb_1.png', name: 'Medium 1 (7,000kg – 34,000kg)'},
    13: {icon: 'adsb_2.png', name: 'Medium 2 (34,000kg – 136,000kg)'},
    14: {icon: 'adsb_14.png', name: 'High vortex large'},
    15: {icon: 'adsb_5.png', name: 'Heavy'},
    16: {icon: 'adsb_14.png', name: 'High Performance'},
    17: {icon: 'adsb_13.png', name: 'Rotorcraft'}
};

export const getAdsbVehicleType = function(emitterType){
    return ADSB_VEHICLE_TYPE[emitterType] !== undefined ? ADSB_VEHICLE_TYPE[emitterType] : ADSB_VEHICLE_TYPE[0];
}
