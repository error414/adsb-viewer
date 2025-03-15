import React, {useContext, useEffect} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './service/csbeeParser';
import AdsbTableComponent from './component/AdsbTableComponent';
import ConnectionComponent from './component/ConnectionComponent';
import MapComponent from './component/MapComponent';
import {SerialContext} from "./SerialProvider";
import {AircraftContext} from './context/AircraftContext';
import {parseCsbeeVehiclesData} from "./service/csbeeParser";
import HighPriorityIntervalComponent from "./component/HighPriorityIntervalComponent";

const App = () => {
    const { canUseSerial,  subscribe, } = useContext(SerialContext);
    const { ADSBVehicles, setADSBVehicles} = useContext(AircraftContext);

    useEffect(() => {
        if (canUseSerial) {
            const unsubscribe = subscribe((data) => {
                let ADSBVehiclesParsed = parseCsbeeVehiclesData(data.value, ADSBVehicles);
                setADSBVehicles({ ...ADSBVehicles, ...ADSBVehiclesParsed});
            });

            // Cleanup subscription on unmount
            return () => {
                unsubscribe();
            };
        }
    }, [canUseSerial, subscribe, ADSBVehicles, setADSBVehicles]);


  return (
      <Container fluid style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <HighPriorityIntervalComponent />
          <Row style={{ backgroundColor: "#05114f", color: "#cbced4"}}>
              <Col>
                  <h1>ADSBee Local Live Map</h1>
              </Col>
              <Col xs lg="2">
                  <ConnectionComponent />
              </Col>
          </Row>
          <Row style={{ flex: 1 }}>
              <Col className="h-auto">
                  <MapComponent />
              </Col>
              <Col xs lg="4">
                  <AdsbTableComponent />
              </Col>
          </Row>
      </Container>
  );
};

export default App;
