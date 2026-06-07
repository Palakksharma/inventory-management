import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, MenuItem } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const Signup = () => {
  // Now including ALL the required fields from your Schema
  const [user, setUser] = useState({ 
    userName: '', 
    email: '', 
    password: '', 
    role: 'worker', 
    organization: '' 
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      // Address matches your server.js /api/auth
      await axios.post(`${API_BASE_URL}/api/auth/signup`, user);
      alert("Account created successfully!");
    } catch (err) {
      console.log(err.response.data); // This tells you exactly what the server disliked
      alert("Signup failed. Check the console for details.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
            Create Account
          </Typography>
          
          <TextField fullWidth label="Full Name" name="userName" onChange={handleChange} margin="dense" />
          <TextField fullWidth label="Email" name="email" onChange={handleChange} margin="dense" />
          <TextField fullWidth label="Password" name="password" type="password" onChange={handleChange} margin="dense" />
          
          {/* Organization is MANDATORY in your Schema */}
          <TextField 
            fullWidth 
            label="Organization Name" 
            name="organization" 
            onChange={handleChange} 
            margin="dense" 
            helperText="e.g. Ludhiana Warehouse Corp"
          />

          {/* Role Dropdown (Matches your Enum) */}
          <TextField
            select
            fullWidth
            label="Role"
            name="role"
            value={user.role}
            onChange={handleChange}
            margin="dense"
          >
            <MenuItem value="worker">Worker</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          
          <Button 
            fullWidth 
            variant="contained" 
            size="large"
            sx={{ mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none' }}
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Signup;