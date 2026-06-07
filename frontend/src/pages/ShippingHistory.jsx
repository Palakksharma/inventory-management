
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Box, Paper, Table, TableBody, TableCell, TableContainer, 
//   TableHead, TableRow, Typography, Chip, Button, CircularProgress 
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// const ShippingHistory = () => {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 1. Fetch Shipping Logs
//   const fetchLogs = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("http://localhost:5000/api/shipping/all", { withCredentials: true });
//       setLogs(res.data);
//     } catch (err) {
//       console.error("Error fetching logs:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLogs();
//   }, []);

//   // 2. Handle Delivery Completion
//   const handleMarkDelivered = async (id) => {
//     try {
//       // This hits the backend to update status and reset the truck
//       await axios.patch(`http://localhost:5000/api/shipping/${id}/status`, 
//         { status: 'Delivered' }, 
//         { withCredentials: true }
//       );
      
//       alert("Delivery confirmed! Truck has been reset to Idle.");
//       fetchLogs(); // Refresh the list
//     } catch (err) {
//       alert("Failed to update status. Please try again.");
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', ml: '280px' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 4, ml: '280px', bgcolor: '#F8F9FA', minHeight: '100vh' }}>
//       <Typography variant="h4" fontWeight="800" sx={{ mb: 4, color: '#102542' }}>
//         Logistics History
//       </Typography>

//       <TableContainer component={Paper} sx={{ borderRadius: '15px', boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
//         <Table>
//           <TableHead sx={{ bgcolor: '#F1F3F5' }}>
//             <TableRow>
//               <TableCell sx={{ fontWeight: '700' }}>Dispatch Date</TableCell>
//               <TableCell sx={{ fontWeight: '700' }}>Product</TableCell>
//               <TableCell sx={{ fontWeight: '700' }}>Qty</TableCell>
//               <TableCell sx={{ fontWeight: '700' }}>Total Weight</TableCell>
//               <TableCell sx={{ fontWeight: '700' }}>Vehicle</TableCell>
//               <TableCell sx={{ fontWeight: '700' }}>Status</TableCell>
//               <TableCell sx={{ fontWeight: '700' }} align="right">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {logs.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
//                   <Typography color="textSecondary">No shipping records found.</Typography>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               logs.map((log) => (
//                 <TableRow key={log._id} hover>
//                   <TableCell>
//                     {new Date(log.createdAt).toLocaleDateString()}
//                   </TableCell>
                  
//                   <TableCell sx={{ fontWeight: '600' }}>
//                     {log.product?.title || "Deleted Product"}
//                   </TableCell>
                  
//                   <TableCell>{log.quantity}</TableCell>
                  
//                   <TableCell>{log.totalWeight} kg</TableCell>
                  
//                   <TableCell>
//                     <Chip 
//                       label={log.fleet?.vehicleNumber || "N/A"} 
//                       variant="outlined" 
//                       size="small" 
//                     />
//                   </TableCell>
                  
//                   <TableCell>
//                     <Chip 
//                       icon={log.status?.toLowerCase() === 'delivered' ? <CheckCircleIcon /> : <LocalShippingIcon />}
//                       label={log.status} 
//                       size="small"
//                       sx={{ 
//                         fontWeight: '700',
//                         // Logic handles "Pending", "In Transit", etc. as the same "active" state
//                         bgcolor: log.status?.toLowerCase() === 'delivered' ? '#E8F5E9' : '#FFF3E0',
//                         color: log.status?.toLowerCase() === 'delivered' ? '#2E7D32' : '#E65100',
//                         textTransform: 'capitalize'
//                       }} 
//                     />
//                   </TableCell>

//                   <TableCell align="right">
//                     {/* The button appears for ANY status that isn't 'delivered' */}
//                     {log.status?.toLowerCase() !== 'delivered' && (
//                       <Button 
//                         variant="contained" 
//                         size="small" 
//                         color="success"
//                         sx={{ borderRadius: '8px', textTransform: 'none' }}
//                         onClick={() => handleMarkDelivered(log._id)}
//                       >
//                         Confirm Delivery
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default ShippingHistory;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Chip, Button, CircularProgress 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const ShippingHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/shipping/all`, getAuthHeader());
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleMarkDelivered = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/shipping/${id}/status`, 
        { status: 'Delivered' }, 
        getAuthHeader()
      );
      alert("Delivery confirmed! Truck has been reset to Idle.");
      fetchLogs();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', ml: '280px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, ml: '280px', bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#102542', fontWeight: 800 }}>
        Logistics History
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: '15px', boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F1F3F5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Dispatch Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Weight</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="textSecondary">No shipping records found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{log.product?.title || "Deleted Product"}</TableCell>
                  <TableCell>{log.quantity}</TableCell>
                  <TableCell>{log.totalWeight} kg</TableCell>
                  <TableCell>
                    <Chip label={log.fleet?.vehicleNumber || "N/A"} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={log.status?.toLowerCase() === 'delivered' ? <CheckCircleIcon /> : <LocalShippingIcon />}
                      label={log.status} 
                      size="small"
                      sx={{ 
                        fontWeight: 700,
                        bgcolor: log.status?.toLowerCase() === 'delivered' ? '#E8F5E9' : '#FFF3E0',
                        color: log.status?.toLowerCase() === 'delivered' ? '#2E7D32' : '#E65100',
                        textTransform: 'capitalize'
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {log.status?.toLowerCase() !== 'delivered' && (
                      <Button variant="contained" size="small" color="success" sx={{ borderRadius: '8px', textTransform: 'none' }} onClick={() => handleMarkDelivered(log._id)}>
                        Confirm Delivery
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ShippingHistory;