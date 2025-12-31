// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Your global Tailwind CSS

// Assuming you have these context providers
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './components/sidebar'; // Import the SidebarProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidebarProvider> {/* Wrap your App with SidebarProvider */}
        <App />
      </SidebarProvider>
    </ThemeProvider>
  </React.StrictMode>
);