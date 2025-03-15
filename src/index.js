import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SerialProvider from './SerialProvider';
import AircraftProvider from './context/AircraftContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <SerialProvider>
      <AircraftProvider >
          <React.StrictMode>
              <App />
          </React.StrictMode>
      </AircraftProvider>
    </SerialProvider>
);
