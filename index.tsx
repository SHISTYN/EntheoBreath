
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AudioProvider } from './context/AudioContext';
import { GamificationProvider } from './contexts/GamificationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AudioProvider>
        <GamificationProvider>
          <App />
        </GamificationProvider>
      </AudioProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
