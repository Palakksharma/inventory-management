
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, Button, Typography, MenuItem, LinearProgress, Chip 
} from '@mui/material';

const Fleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: "",
    vehicleType: "Truck",
    driverName: "",
    driverPhone: "",
    maxWeightCapacity: ""
  });

  // 1. Fetch Fleet Data with the Admin Token
  const fetchFleet = async () => {
    try {
      const token = localStorage.getItem('token'); // Grab the key from login
      
      const res = await axios.get(`${API_BASE_URL}/api/fleet/all`, {
        headers: {
          Authorization: `Bearer ${token}` // Show the key to the 'protect' middleware
        }
      });
      
      setVehicles(res.data);
    } catch (err) {
      console.error("Error fetching fleet:", err);
      // If you get a 401 here, it means the token is missing or expired
    }
  };

  useEffect(() => { 
    fetchFleet(); 
  }, []);

  // 2. Handle Add Vehicle with the Admin Token
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/api/fleet/add`, newVehicle, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setIsAdding(false);
      setNewVehicle({ 
        vehicleNumber: "", 
        vehicleType: "Truck", 
        driverName: "", 
        driverPhone: "", 
        maxWeightCapacity: "" 
      });
      fetchFleet(); // Refresh the list after adding
      alert("Vehicle successfully added to fleet!");
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add vehicle. Check permissions or if the Number is unique.");
    }
  };

  return (
    <Box sx={{ p: 4, ml: '280px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Fleet Management</Typography>
        <Button 
          variant="contained" 
          sx={{ bgcolor: '#102542', '&:hover': { bgcolor: '#1a3a63' } }} 
          onClick={() => setIsAdding(true)}
        >
          + Add New Vehicle
        </Button>
      </Box>

      {isAdding ? (
        <Paper sx={{ p: 4, borderRadius: '12px' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>Vehicle Registration</Typography>
          <form onSubmit={handleAddVehicle}>
            <TextField 
              fullWidth 
              label="Vehicle Number (e.g., TRK-101)" 
              sx={{ mb: 2 }} 
              required 
              value={newVehicle.vehicleNumber} 
              onChange={(e) => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})} 
            />
            
            <TextField 
              select 
              fullWidth 
              label="Type" 
              sx={{ mb: 2 }} 
              value={newVehicle.vehicleType} 
              onChange={(e) => setNewVehicle({...newVehicle, vehicleType: e.target.value})}
            >
              <MenuItem value="Truck">Truck</MenuItem>
              <MenuItem value="Van">Van</MenuItem>
              <MenuItem value="Bike">Bike</MenuItem>
            </TextField>

            <TextField 
              fullWidth 
              label="Driver Name" 
              sx={{ mb: 2 }} 
              required 
              value={newVehicle.driverName} 
              onChange={(e) => setNewVehicle({...newVehicle, driverName: e.target.value})} 
            />
            
            <TextField 
              fullWidth 
              label="Max Capacity (kg)" 
              type="number" 
              sx={{ mb: 3 }} 
              required 
              value={newVehicle.maxWeightCapacity} 
              onChange={(e) => setNewVehicle({...newVehicle, maxWeightCapacity: e.target.value})} 
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">Save to Fleet</Button>
              <Button variant="outlined" onClick={() => setIsAdding(false)}>Cancel</Button>
            </Box>
          </form>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9FA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Vehicle / Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Load Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No vehicles found in fleet.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => {
                  const usage = (v.currentWeightLoad / v.maxWeightCapacity) * 100;
                  return (
                    <TableRow key={v._id}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 'bold' }}>{v.vehicleNumber}</Typography>
                        <Typography variant="caption" color="textSecondary">{v.vehicleType}</Typography>
                      </TableCell>
                      <TableCell>{v.driverName}</TableCell>
                      <TableCell sx={{ width: '30%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">{v.currentWeightLoad} / {v.maxWeightCapacity} kg</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{Math.round(usage)}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={usage > 100 ? 100 : usage} 
                          color={usage > 90 ? "error" : "primary"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={v.status} 
                          size="small" 
                          variant="outlined"
                          color={v.status === 'Idle' ? "success" : "info"} 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Fleet;