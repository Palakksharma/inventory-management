
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Page & Component Imports
import Login from './pages/Login.js';
import Dashboard from './components/Dashboard.js';
import Inventory from './pages/Inventory.jsx';
import Fleet from './pages/Fleet';
import ShippingHistory from './pages/ShippingHistory';
import DriverDashboard from './pages/DriverDashboard.jsx';
import WarehouseDashboard from './manager/WarehouseDashboard.jsx';

// 👑 PERMANENT CYBER DARK THEME CONFIGURATION
const globalDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#a855f7' 
    }, 
    background: { 
      default: '#07080a', 
      paper: '#0d1117'    
    },
    text: {
      primary: '#e2e8f0',  
      secondary: '#8b949e' 
    },
    border: {
      main: '#21262d'     
    }
  },
  shape: { 
    borderRadius: 12 
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});

// 🔒 DYNAMIC ROUTE GUARD (Timing gap khatam karne ke liye helper)
const ProtectedDriverRoute = ({ children }) => {
  // Yeh line jab page change hoga tab active current role check karegi
  const currentRole = localStorage.getItem("role");
  
  if (currentRole && currentRole.toLowerCase() === 'driver') {
    return children;
  }
  
  // Agar role mismatch ho toh hi login par bheje
  return <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <ThemeProvider theme={globalDarkTheme}>
      <CssBaseline /> 
      <BrowserRouter>
        <Routes>
          {/* Public Entrance Interfaces */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Core Operations Admin Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory/>}/>
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/shipping-history" element={<ShippingHistory />} />
          
          {/* 🚚 Fully Fixed Protected Driver Route */}
          <Route 
            path="/driver-dashboard" 
            element={
              <ProtectedDriverRoute>
                <DriverDashboard />
              </ProtectedDriverRoute>
            } 
          />

          {/* Secure Internal Warehouse Management Interface */}
          <Route 
            path="/warehouse-dashboard" 
            element={<WarehouseDashboard />} 
          />
          
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
