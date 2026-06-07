

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { styled } from '@mui/material/styles';
// import Lottie from "lottie-react";
// import loginAnimation from "../assets/Login.json";
// import { 
//   Box, Paper, Grid, Typography, TextField, 
//   InputAdornment, IconButton, Button 
// } from '@mui/material';

// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import EmailIcon from '@mui/icons-material/Email';
// import LockIcon from '@mui/icons-material/Lock';

// const Item = styled(Paper)(({ theme }) => ({
//   backgroundColor: theme.palette.background.paper,
//   padding: theme.spacing(5), 
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
//   minHeight: '500px', 
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   alignItems: 'center',
//   borderRadius: '20px', 
//   boxShadow: theme.shadows[10]
// }));

// const Login = () => {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignIn = async () => {
//     try {
//       const response = await axios.post("http://localhost:5000/api/auth/signin", {
//         email: email,
//         password: password
//       });

//       // Destructure role and potentially userName/id from the response
//       const { token, role, userName } = response.data;

//       // 1. SAVE TOKEN AS COOKIE (Required for backend protect middleware)
//       document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      
//       // 2. SAVE TO LOCALSTORAGE
//       localStorage.setItem("token", token);
//       localStorage.setItem("role", role); 
//       // Optional: Store the username to display "Welcome back, Palak" dynamically
//       if(userName) localStorage.setItem("userName", userName);
      
//       console.log(`Login Success as ${role}, navigating...`);

//       // 3. DYNAMIC REDIRECTION BASED ON ROLE
//       if (role === "admin") {
//         navigate('/dashboard'); 
//       } else if (role === "driver") {
//         navigate('/driver-dashboard');
//       } else if (role === "manager") {
//         // Redirect to your newly fixed Warehouse Manager Dashboard
//         navigate('/warehouse-dashboard');
//       } else {
//         alert(`Access permitted for ${role}, but no specific dashboard found.`);
//       }

//     } catch (error) {
//       console.error("Login Error:", error);
//       const errorMsg = error.response?.data?.message || "Invalid Email or Password.";
//       alert(errorMsg);
//     }
//   };

//   return (
//     <Box sx={{ flexGrow: 1, bgcolor: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
//       <Grid container spacing={4} sx={{ maxWidth: '1200px' }}>
//         <Grid item xs={12} md={7}> 
//           <Item>
//             <Lottie animationData={loginAnimation} loop={true} style={{ height: 350 }} />
//             <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
//               SUPPLY CHAIN MANAGEMENT SYSTEM
//             </Typography>
//           </Item>
//         </Grid>
//         <Grid item xs={12} md={5}>
//           <Item>
//             <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">Login</Typography>
//             <Typography variant="body2" sx={{ mb: 3 }}>Enter your credentials to access your portal</Typography>
            
//             <Box sx={{ width: '100%', maxWidth: '340px' }}>
//               <TextField 
//                 label="Email Address" 
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 fullWidth 
//                 margin="normal"
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <EmailIcon color="action" />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <TextField 
//                 label="Password" 
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 fullWidth 
//                 margin="normal" 
//                 type={showPassword ? 'text' : 'password'}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <LockIcon color="action" />
//                     </InputAdornment>
//                   ),
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={() => setShowPassword(!showPassword)}>
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <Button 
//                 onClick={handleSignIn}
//                 variant="contained" 
//                 fullWidth 
//                 sx={{ 
//                   mt: 4, 
//                   py: 1.5, 
//                   borderRadius: '12px', 
//                   fontWeight: 'bold',
//                   fontSize: '1.1rem',
//                   textTransform: 'none'
//                 }}
//               >
//                 Sign In
//               </Button>
//             </Box>
//           </Item>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }

// export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { styled } from '@mui/material/styles';
import Lottie from "lottie-react";
import loginAnimation from "../assets/Login.json";
import { 
  Box, Paper, Grid, Typography, TextField, 
  InputAdornment, IconButton, Button 
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper || '#0d1117',
  padding: theme.spacing(5), 
  textAlign: 'center',
  color: theme.palette.text.primary,
  minHeight: '500px', 
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '20px', 
  boxShadow: '0px 10px 30px rgba(0,0,0,0.5)',
  border: '1px solid #21262d'
}));

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      console.log("🚀 Login initialization for:", email);

      // Backend Sign-In Request
      const response = await axios.post(`${API_BASE_URL}/api/auth/signin`, {
        email: email,
        password: password
      });

      // Destructure data from backend response
      const { token, role, userName, warehouseId } = response.data;

      // Safe check: Agar role empty string ya undefined mile
      if (!role) {
        alert("Authentication error: Server returned no role attribute.");
        return;
      }

      // 🧼 Case-Insensitive Conversion Safeguard (E.g., "Driver" -> "driver")
      const safeRole = role.toLowerCase().trim();

      // 1. SAVE TOKEN AS COOKIE (Required for backend protect middleware)
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      
      // 2. SAVE TO LOCALSTORAGE 
      localStorage.setItem("token", token);
      localStorage.setItem("role", safeRole); 
      
      if (userName) localStorage.setItem("userName", userName);
      if (warehouseId) localStorage.setItem("warehouseId", warehouseId); 
      
      console.log(`Login Success as raw: ${role} | verified-target: ${safeRole}, navigating...`);

      // 3. DYNAMIC REDIRECTION BASED ON VERIFIED LOWERCASE SAFE ROLE
      if (safeRole === "admin") {
        navigate('/dashboard'); 
      } else if (safeRole === "driver") {
        console.log("Executing redirect path to: /driver-dashboard");
        navigate('/driver-dashboard');
      } else if (safeRole === "manager" || safeRole === "warehouse_manager") {
        navigate('/warehouse-dashboard');
      } else {
        alert(`Access permitted for role [${role}], but no specific dashboard layout is mapped.`);
      }

    } catch (error) {
      console.error("Login Client-Side Error:", error);
      const errorMsg = error.response?.data?.message || "Invalid Email or Password.";
      alert(errorMsg);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#07080a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Grid container spacing={4} sx={{ maxWidth: '1200px' }}>
        <Grid item xs={12} md={7}> 
          <Item>
            <Lottie animationData={loginAnimation} loop={true} style={{ height: 350 }} />
            <Typography variant="h6" color="textSecondary" sx={{ mt: 2, fontWeight: '700', letterSpacing: '0.5px' }}>
              SUPPLY CHAIN MANAGEMENT SYSTEM
            </Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={5}>
          <Item>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">Login</Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>Enter your credentials to access your portal</Typography>
            
            <Box sx={{ width: '100%', maxWidth: '340px' }}>
              <TextField 
                label="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth 
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    borderRadius: '12px'
                  }
                }}
              />
              <TextField 
                label="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth 
                margin="normal" 
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    borderRadius: '12px'
                  }
                }}
              />
              <Button 
                onClick={handleSignIn}
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 4, 
                  py: 1.8, 
                  borderRadius: '12px', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  bgcolor: '#a855f7',
                  '&:hover': { bgcolor: '#9333ea' }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Login;
