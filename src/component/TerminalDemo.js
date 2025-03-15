import { Terminal } from 'primereact/terminal';
import { TerminalService } from 'primereact/terminalservice';
import React, {useEffect} from 'react';
import '../css/TerminalDemo.css'
import {Container, Row, Col, Button, Form} from 'react-bootstrap';

const TerminalDemo = () => {

    const commandHandler = (text) => {
        let response;
        let argsIndex = text.indexOf(' ');
        let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

        switch (command) {
            case 'date':
                response = 'Today is ' + new Date().toDateString();
                break;

            case 'greet':
                response = 'Hola ' + text.substring(argsIndex + 1) + '!';
                break;

            case 'random':
                response = Math.floor(Math.random() * 100);
                break;

            case 'clear':
                response = null;
                break;

            default:
                response = 'Unknown command: ' + command;
                break;
        }

        if (response) {
            TerminalService.emit('response', response);
        }
        else {
            TerminalService.emit('clear');
        }
    }

    const handleConnect = async () => {
        console.log('asdasd')
        TerminalService.emit('response', "test");
    };

    useEffect(() => {
        TerminalService.on('command', commandHandler);

        return () => {
            TerminalService.off('command', commandHandler);
        }
    }, []);

    return (
        <div className="terminal-demo">
            <div className="card">
                <Terminal welcomeMessage="Welcome to Adsbee1090" prompt="adsbee $"/>
            </div>
            <Button variant="primary" onClick={handleConnect}>
                emit
            </Button>
        </div>
    );
}

export default TerminalDemo;