import React, {useContext, useState } from 'react';
import { SerialContext } from '../SerialProvider';
import {Container, Row, Col, Button, Form} from 'react-bootstrap';
const ConnectionComponent = ({ setIncomingLine }) => {

    const {
        portState,
        connect,
        disconnect,
    } = useContext(SerialContext);

    const [selectedBaudRate, setSelectedBaudRate] = useState(9600);


    const handleConnect = async () => {
        const success = await connect(selectedBaudRate);
        if (success) {
            console.log('Successfully connected');
        } else {
            console.log('Failed to connect');
        }
    };

    const handleDisconnect = async () => {
        await disconnect();
        console.log('Disconnected');
    };

    const handleSelectBaudRate = (e) => {
        setSelectedBaudRate(e.target.value);
    };

    return (
        <div style={{ padding: '10px' }}>
            {portState === 'open' ? (
                <Container>
                    <Row>
                        <Col xs lg="7">
                        </Col>
                        <Col xs lg="5">
                            <Button variant="danger" onClick={handleDisconnect} disabled={portState === 'closed'}>
                                Disconnect
                            </Button >
                        </Col>
                    </Row>
                </Container>
            ) : (
                <Container>
                    <Row>
                        <Col xs lg="7">
                            <Form.Select value={selectedBaudRate} onChange={handleSelectBaudRate}>
                                <option value="9600">9600</option>
                                <option value="115200">115200</option>
                            </Form.Select>
                        </Col>
                        <Col xs lg="5">
                            <Button variant="primary" onClick={handleConnect} disabled={portState === 'open'}>
                                Connect
                            </Button>
                        </Col>
                    </Row>
                </Container>
            )}
        </div>
    );
};

export default ConnectionComponent;
