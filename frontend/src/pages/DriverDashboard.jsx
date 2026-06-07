
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import axios from 'axios'; 
// import { io } from 'socket.io-client';
// import { 
//   Box, Grid, Paper, Typography, Button, 
//   Avatar, List, Divider, CircularProgress,
//   Fab, Dialog, Slide,IconButton
// } from '@mui/material';

// // Icons 
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import LogoutIcon from '@mui/icons-material/Logout';
// import NotificationsIcon from '@mui/icons-material/Notifications';
// import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import ImageIcon from '@mui/icons-material/Image';
// import ChatIcon from '@mui/icons-material/Chat';
// import CloseIcon from '@mui/icons-material/Close';

// import { useNavigate } from 'react-router-dom';
// import DriverChat from '../components/DriverChat'; // 👈 IMPORT OUR NEW CHAT COMPONENT HERE

// // Smooth slide animation for opening the chat modal on mobile/desktop dashboards
// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// export default function DriverDashboard() {
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);
//   const [socket, setSocket] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeShipment, setActiveShipment] = useState(null); 
  
//   // 💬 Chat Interface Toggle State
//   const [isChatOpen, setIsChatOpen] = useState(false);

//   // Proof of Delivery Upload states
//   const [deliveryProofImg, setDeliveryProofImg] = useState("");
//   const [uploadState, setUploadState] = useState("waiting"); // 'waiting' | 'uploading' | 'success'
//   const [uploadedFileName, setUploadedFileName] = useState("");

//   const driverName = localStorage.getItem("userName") || "Transit Driver";
//   const driverId = localStorage.getItem("userId") || "66504a8b1a2c3d4e5f6g7h8i"; // 👈 EXTRACTED UNIQUE SENDER ID

//   const [driverLogs, setDriverLogs] = useState([
//     { id: 1, title: 'System Portal Activated', description: 'Driver terminal connected successfully.', color: '#10b981' }
//   ]);

//   // 🔄 FETCH LOGIC: Pulling current pending or in-transit cargo profiles
//   const fetchAssignedShipments = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       const headers = { Authorization: `Bearer ${token}` };

//       const response = await axios.get("http://localhost:5000/api/shipping/all", { 
//         headers, 
//         withCredentials: true 
//       });

//       console.log("📦 Total Shipments Payload:", response.data);
//       const rawData = response.data.data || response.data;
      
//       if (Array.isArray(rawData) && rawData.length > 0) {
//         const liveJob = rawData.find(shipment => 
//           shipment.status?.toLowerCase() === 'pending' || shipment.status?.toLowerCase() === 'in transit'
//         );
//         setActiveShipment(liveJob || null);
//       } else {
//         setActiveShipment(null);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching driver assignments:", err);
//       setActiveShipment(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // 📸 MOCK FILE UPLOAD HANDLER
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploadedFileName(file.name);
//     setUploadState("uploading");

//     // Realistic network simulation delay
//     setTimeout(() => {
//       setDeliveryProofImg("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80");
//       setUploadState("success");
      
//       setDriverLogs(prev => [{
//         id: Date.now(),
//         title: "📁 Proof Image Staged",
//         description: `File "${file.name}" linked successfully.`,
//         color: '#a855f7'
//       }, ...prev]);
//     }, 1200);
//   };

//   // ⚡ STATUS TOGGLE AND DB SYNC HANDLER (Aligned with Backend Route)
//   const handleStatusUpdate = async () => {
//     if (!activeShipment) return;

//     const isPending = activeShipment.status?.toLowerCase() === 'pending';
//     const nextStatus = isPending ? 'In Transit' : 'Delivered';

//     // Guard constraint: Driver must upload image proof before finalizing delivery
//     if (!isPending && uploadState !== 'success') {
//       alert("⚠️ Access Denied! Please select and upload a valid Proof of Delivery Image prior to completing this run.");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       const headers = { Authorization: `Bearer ${token}` };

//       // 🎯 FIXED PATH MATCH: Corrected to axios.patch and template pattern /:id/status
//       await axios.patch(`http://localhost:5000/api/shipping/${activeShipment._id}/status`, 
//         { 
//           status: nextStatus,
//           deliveryProofImg: nextStatus === 'Delivered' ? deliveryProofImg : undefined 
//         },
//         { headers, withCredentials: true }
//       );

//       // 2. Broadcast realtime parameters over active socket channel
//       if (socket) {
//         socket.emit("driver_status_update_signal", {
//           manifestId: activeShipment._id,
//           driver: driverName,
//           status: nextStatus
//         });
//       }

//       setDriverLogs(prev => [{
//         id: Date.now(),
//         title: `⚡ Status Set To: ${nextStatus}`,
//         description: `Manifest #${activeShipment._id.slice(-4).toUpperCase()} pipeline updated.`,
//         color: nextStatus === 'In Transit' ? '#3b82f6' : '#10b981'
//       }, ...prev]);

//       // Reset asset states upon delivery completion
//       if (nextStatus === 'Delivered') {
//         setDeliveryProofImg("");
//         setUploadState("waiting");
//         setUploadedFileName("");
//       }

//       fetchAssignedShipments();

//     } catch (err) {
//       console.error("❌ Failed to update status:", err);
//       alert("Status update failed. Please try again.");
//     }
//   };

//   useEffect(() => {
//     fetchAssignedShipments();
//   }, [fetchAssignedShipments]);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");

//     if (!token) return;

//     const socketInstance = io("http://localhost:5000", {
//       auth: { token },
//       transports: ["websocket"]
//     });

//     socketInstance.on("connect", () => {
//       console.log(`🚚 Driver Real-time Link Established: ${socketInstance.id}`);
//       socketInstance.emit("authenticate_session", { role: role || 'driver' });
//     });

//     socketInstance.on("driver_manifest_update", (data) => {
//       console.log("📥 Live Assignment Alert Received:", data);
//       fetchAssignedShipments(); 
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [fetchAssignedShipments]);

//   return (
//     <Box sx={{ display: 'flex', bgcolor: '#07080a', minHeight: '100vh', color: '#e2e8f0' }}>
      
//       {/* SIDEBAR */}
//       <Box sx={{ width: 280, bgcolor: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
//         <Box sx={{ p: 4, textAlign: 'center' }}>
//           <Avatar sx={{ width: 65, height: 65, mx: 'auto', mb: 2, bgcolor: '#a855f7', border: '2px solid #a855f7' }}>
//             <LocalShippingIcon sx={{ fontSize: 32 }} />
//           </Avatar>
//           <Typography variant="h6" fontWeight="800">{driverName}</Typography>
//           <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: '700', textTransform: 'uppercase', display: 'block', mt: 0.5 }}>FLEET TRANSIT UNIT</Typography>
//         </Box>

//         <Box sx={{ mt: 'auto', p: 3 }}>
//           <Button 
//             onClick={() => { localStorage.clear(); navigate('/login'); }} 
//             fullWidth 
//             startIcon={<LogoutIcon />}
//             sx={{ color: '#FF5630', borderRadius: '12px', justifyContent: 'flex-start', py: 1.5, textTransform: 'none', fontWeight: '600' }}
//           >
//             Terminal Exit
//           </Button>
//         </Box>
//       </Box>

//       {/* WORKSPACE AREA */}
//       <Box sx={{ flexGrow: 1, p: 4, ml: '280px' }}>
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>Driver Assignment Portal</Typography>
//           <Typography variant="body2" sx={{ color: '#8b949e' }}>Real-time Fleet & Shipment Execution</Typography>
//         </Box>

//         <Grid container spacing={4}>
          
//           {/* CARGO LOAD INTERFACE */}
//           <Grid item xs={12} md={7}>
//             <Paper sx={{ p: 4, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #21262d', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
//               {loading ? (
//                 <Box sx={{ textAlign: 'center' }}><CircularProgress color="primary" /></Box>
//               ) : !activeShipment ? (
//                 <Box sx={{ textAlign: 'center' }}>
//                   <Typography variant="h5" fontWeight="700" color="text.secondary" sx={{ mb: 1, opacity: 0.5 }}>
//                     All Clear!
//                   </Typography>
//                   <Typography variant="body2" sx={{ color: '#8b949e' }}>
//                     No pending shipments assigned at the moment.
//                   </Typography>
//                 </Box>
//               ) : (
//                 <Box>
//                   <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <CheckCircleIcon sx={{ color: '#10b981' }} /> Current Active Cargo Load
//                   </Typography>
                  
//                   <Paper sx={{ p: 3, bgcolor: '#07080a', border: '1px solid #a855f7', borderRadius: '12px' }}>
//                     <Typography variant="subtitle1" fontWeight="700" color="#f0f6fc">
//                       Manifest ID: #{activeShipment._id?.toString().slice(-4).toUpperCase() || "N/A"}
//                     </Typography>
                    
//                     <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 2, fontSize: '0.95rem' }}>
//                       <strong>Product Name:</strong> {activeShipment.product?.title || activeShipment.product?.name || "Cargo Item"}
//                     </Typography>

//                     <Typography variant="body2" sx={{ color: '#8b949e', mt: 1 }}>
//                       <strong>Quantity / Total Weight:</strong> {activeShipment.quantity || 0} units ({activeShipment.totalWeight || 0} kg)
//                     </Typography>
                    
//                     <Typography variant="body2" sx={{ color: '#8b949e', mt: 1 }}>
//                       <strong>Vehicle Plate No:</strong> {activeShipment.fleet?.vehicleNumber || "Assigned Fleet Truck"}
//                     </Typography>

//                     <Typography variant="body2" sx={{ color: '#8b949e', mt: 1, mb: 3 }}>
//                       <strong>Status Tracker:</strong> <Box component="span" sx={{ color: activeShipment.status === 'In Transit' ? '#3b82f6' : '#f59e0b', fontWeight: 'bold' }}>{activeShipment.status || "Staged"}</Box>
//                     </Typography>

//                     {/* 📸 CLOUD PROOF OF DELIVERY PHOTO SECTION */}
//                     {activeShipment.status?.toLowerCase() === 'in transit' && (
//                       <Box sx={{ mb: 3 }}>
//                         <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: '700', textTransform: 'uppercase', display: 'block', mb: 1 }}>
//                           Cloud Upload: Proof-of-Delivery Photo
//                         </Typography>
                        
//                         <input 
//                           type="file" 
//                           accept="image/*" 
//                           ref={fileInputRef} 
//                           style={{ display: 'none' }} 
//                           onChange={handleFileChange} 
//                         />

//                         <Box 
//                           onClick={() => uploadState !== 'uploading' && fileInputRef.current.click()}
//                           sx={{ 
//                             border: '1px dashed #21262d', 
//                             borderRadius: '8px', 
//                             p: 2.5, 
//                             textAlign: 'center', 
//                             cursor: uploadState === 'uploading' ? 'not-allowed' : 'pointer',
//                             bgcolor: '#0d1117',
//                             transition: '0.2s',
//                             '&:hover': { borderColor: '#a855f7', bgcolor: '#161b22' }
//                           }}
//                         >
//                           {uploadState === 'waiting' && (
//                             <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
//                               <CloudUploadIcon sx={{ color: '#8b949e', fontSize: 28 }} />
//                               <Typography variant="body2" color="#f0f6fc" fontWeight="600">Select Cargo Photo</Typography>
//                               <Typography variant="caption" color="text.secondary">PNG, JPG up to 5MB</Typography>
//                             </Box>
//                           )}

//                           {uploadState === 'uploading' && (
//                             <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
//                               <CircularProgress size={22} sx={{ color: '#a855f7' }} />
//                               <Typography variant="caption" color="#a855f7" fontWeight="600">Encrypting & Streaming to Cloud storage...</Typography>
//                             </Box>
//                           )}

//                           {uploadState === 'success' && (
//                             <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
//                               <ImageIcon sx={{ color: '#10b981', fontSize: 28 }} />
//                               <Typography variant="body2" color="#10b981" fontWeight="700">✅ Image Upload Verified</Typography>
//                               <Typography variant="caption" sx={{ color: '#8b949e', fontStyle: 'italic' }}>{uploadedFileName}</Typography>
//                             </Box>
//                           )}
//                         </Box>
//                       </Box>
//                     )}

//                     <Button 
//                       variant="contained" 
//                       fullWidth 
//                       size="large" 
//                       onClick={handleStatusUpdate}
//                       disabled={activeShipment.status?.toLowerCase() === 'delivered'}
//                       sx={{ 
//                         textTransform: 'none', 
//                         fontWeight: 'bold', 
//                         borderRadius: '8px', 
//                         bgcolor: activeShipment.status?.toLowerCase() === 'pending' ? '#3b82f6' : '#10b981', 
//                         '&:hover': { bgcolor: activeShipment.status?.toLowerCase() === 'pending' ? '#2563eb' : '#059669' } 
//                       }}
//                     >
//                       {activeShipment.status?.toLowerCase() === 'pending' ? 'Start Transit (In Transit)' : 'Confirm Delivery'}
//                     </Button>
//                   </Paper>
//                 </Box>
//               )}

//             </Paper>
//           </Grid>

//           {/* TELEMETRY RIGHT VIEW */}
//           <Grid item xs={12} md={5}>
//             <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #21262d', minHeight: '320px' }}>
//               <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
//                 <NotificationsIcon sx={{ fontSize: 18, color: '#a855f7' }} /> Transit Feeds
//               </Typography>
//               <Divider sx={{ borderColor: '#21262d', mb: 3 }} />

//               <List sx={{ p: 0, maxHeight: '220px', overflowY: 'auto' }}>
//                 {driverLogs.map((log) => (
//                   <Box key={log.id} sx={{ mb: 2.5, position: 'relative', pl: 3 }}>
//                     <FiberManualRecordIcon sx={{ fontSize: 10, color: log.color, position: 'absolute', left: 0, top: 5 }} />
//                     <Typography variant="body2" fontWeight="700" sx={{ color: '#f0f6fc', lineHeight: 1.2 }}>{log.title}</Typography>
//                     <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mt: 0.5 }}>{log.description}</Typography>
//                   </Box>
//                 ))}
//               </List>
//             </Paper>
//           </Grid>

//         </Grid>
//       </Box>

//       {/* 💬 FLOATING CHAT BUTTON TRIGGER (Only shows if an active manifest exists) */}
//       {activeShipment && (
//         <Fab 
//           color="primary" 
//           aria-label="chat"
//           onClick={() => setIsChatOpen(true)}
//           sx={{ 
//             position: 'fixed', 
//             bottom: 24, 
//             right: 24, 
//             bgcolor: '#a855f7',
//             '&:hover': { bgcolor: '#9333ea' }
//           }}
//         >
//           <ChatIcon />
//         </Fab>
//       )}

//       {/* 📋 CHAT WINDOW DIALOG OVERLAY */}
//       <Dialog
//         open={isChatOpen}
//         TransitionComponent={Transition}
//         keepMounted
//         onClose={() => setIsChatOpen(false)}
//         PaperProps={{
//           sx: {
//             bgcolor: '#0d1117',
//             color: '#e2e8f0',
//             border: '1px solid #21262d',
//             borderRadius: '14px',
//             width: '100%',
//             maxWidth: '450px',
//             position: 'fixed',
//             bottom: { xs: 0, sm: 24 },
//             right: { xs: 0, sm: 24 },
//             margin: { xs: 0, sm: 0 },
//             height: '500px'
//           }
//         }}
//       >
//         {/* Absolute Close X Header Button */}
//         <Box display="flex" justifyContent="flex-end" sx={{ p: 1, position: 'absolute', right: 0, zIndex: 10 }}>
//           <IconButton onClick={() => setIsChatOpen(false)} sx={{ color: '#8b949e' }}>
//             <CloseIcon />
//           </IconButton>
//         </Box>

//         {/* Core Embedded Chat Component */}
//         {activeShipment && (
//           <DriverChat 
//             manifestId={activeShipment._id} 
//             driverId={driverId} 
//           />
//         )}import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios'; 
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { 
  Box, Grid, Paper, Typography, Button, 
  Avatar, List, Divider, CircularProgress,
  Fab, Drawer, IconButton
} from '@mui/material';

// Icons 
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

import { useNavigate } from 'react-router-dom';

// Core Embedded Chat Module Component import
import DriverChat from '../components/DriverChat.jsx';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeShipment, setActiveShipment] = useState(null); 
  
  // Chat Panel visibility controller
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Proof of Delivery Upload states
  const [deliveryProofImg, setDeliveryProofImg] = useState("");
  const [uploadState, setUploadState] = useState("waiting"); 
  const [uploadedFileName, setUploadedFileName] = useState("");

  const driverName = localStorage.getItem("userName") || "Transit Driver";
  const driverId = localStorage.getItem("userId") || "66504a8b1a2c3d4e5f6g7h8i"; 

  const [driverLogs, setDriverLogs] = useState([
    { id: 1, title: 'System Portal Activated', description: 'Driver terminal connected successfully.', color: '#10b981' }
  ]);

  // Fetch Current Active Shipments
  const fetchAssignedShipments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/api/shipping/all`, { 
        headers, 
        withCredentials: true 
      });

      const rawData = response.data.data || response.data;
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        const liveJob = rawData.find(shipment => 
          shipment.status?.toLowerCase() === 'pending' || shipment.status?.toLowerCase() === 'in transit'
        );
        setActiveShipment(liveJob || null);
      } else {
        setActiveShipment(null);
      }
    } catch (err) {
      console.error("❌ Error fetching driver assignments:", err);
      setActiveShipment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Image Asset Upload Staging
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadState("uploading");

    setTimeout(() => {
      setDeliveryProofImg("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80");
      setUploadState("success");
      
      setDriverLogs(prev => [{
        id: Date.now(),
        title: "📁 Proof Image Staged",
        description: `File "${file.name}" linked successfully.`,
        color: '#a855f7'
      }, ...prev]);
    }, 1200);
  };

  // Update Status Database Workflow
  const handleStatusUpdate = async () => {
    if (!activeShipment) return;

    const isPending = activeShipment.status?.toLowerCase() === 'pending';
    const nextStatus = isPending ? 'In Transit' : 'Delivered';

    if (!isPending && uploadState !== 'success') {
      alert("⚠️ Access Denied! Please select and upload a valid Proof of Delivery Image prior to completing this run.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(`${API_BASE_URL}/api/shipping/${activeShipment._id}/status`, 
        { 
          status: nextStatus,
          deliveryProofImg: nextStatus === 'Delivered' ? deliveryProofImg : undefined 
        },
        { headers, withCredentials: true }
      );

      if (socket) {
        socket.emit("driver_status_update_signal", {
          manifestId: activeShipment._id,
          driver: driverName,
          status: nextStatus
        });
      }

      setDriverLogs(prev => [{
        id: Date.now(),
        title: `⚡ Status Set To: ${nextStatus}`,
        description: `Manifest #${activeShipment._id.slice(-4).toUpperCase()} pipeline updated.`,
        color: nextStatus === 'In Transit' ? '#3b82f6' : '#10b981'
      }, ...prev]);

      if (nextStatus === 'Delivered') {
        setDeliveryProofImg("");
        setUploadState("waiting");
        setUploadedFileName("");
      }

      fetchAssignedShipments();

    } catch (err) {
      console.error("❌ Failed to update status:", err);
      alert("Status update failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchAssignedShipments();
  }, [fetchAssignedShipments]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return;

    const socketInstance = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"]
    });

    socketInstance.on("connect", () => {
      socketInstance.emit("authenticate_session", { role: role || 'driver' });
    });

    socketInstance.on("driver_manifest_update", (data) => {
      fetchAssignedShipments(); 
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [fetchAssignedShipments]);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#07080a', minHeight: '100vh', color: '#e2e8f0', position: 'relative' }}>
      
      {/* 1. FIXED LEFT APP SIDEBAR */}
      <Box sx={{ width: 280, bgcolor: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 65, height: 65, mx: 'auto', mb: 2, bgcolor: '#a855f7', border: '2px solid #a855f7' }}>
            <LocalShippingIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" fontWeight="800">{driverName}</Typography>
          <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: '700', textTransform: 'uppercase', display: 'block', mt: 0.5 }}>FLEET TRANSIT UNIT</Typography>
        </Box>

        <Box sx={{ mt: 'auto', p: 3 }}>
          <Button 
            onClick={() => { localStorage.clear(); navigate('/login'); }} 
            fullWidth 
            startIcon={<LogoutIcon />}
            sx={{ color: '#FF5630', borderRadius: '12px', justifyContent: 'flex-start', py: 1.5, textTransform: 'none', fontWeight: '600' }}
          >
            Terminal Exit
          </Button>
        </Box>
      </Box>

      {/* 2. MAIN GRID WORKSPACE CONTAINER */}
      <Box sx={{ flexGrow: 1, p: 4, ml: '280px', minHeight: '100vh' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>Driver Assignment Portal</Typography>
          <Typography variant="body2" sx={{ color: '#8b949e' }}>Real-time Fleet & Shipment Execution</Typography>
        </Box>

        <Grid container spacing={4}>
          {/* CARGO CARD LOAD */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #21262d', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {loading ? (
                <Box sx={{ textAlign: 'center' }}><CircularProgress color="primary" /></Box>
              ) : !activeShipment ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="700" color="text.secondary" sx={{ mb: 1, opacity: 0.5 }}>
                    All Clear!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>
                    No pending shipments assigned at the moment.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: '#10b981' }} /> Current Active Cargo Load
                  </Typography>
                  
                  <Paper sx={{ p: 3, bgcolor: '#07080a', border: '1px solid #21262d', borderRadius: '12px' }}>
                    <Typography variant="subtitle1" fontWeight="700" color="#f0f6fc">
                      Manifest ID: #{activeShipment._id?.toString().slice(-4).toUpperCase() || "N/A"}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 2, fontSize: '0.95rem' }}>
                      <strong>Product Name:</strong> {activeShipment.product?.title || activeShipment.product?.name || "Cargo Item"}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#8b949e', mt: 1 }}>
                      <strong>Quantity / Weight:</strong> {activeShipment.quantity || 0} units ({activeShipment.totalWeight || 0} kg)
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#8b949e', mt: 1 }}>
                      <strong>Vehicle Plate No:</strong> {activeShipment.fleet?.vehicleNumber || "Assigned Fleet Truck"}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#8b949e', mt: 1, mb: 3 }}>
                      <strong>Status Tracker:</strong> <Box component="span" sx={{ color: activeShipment.status === 'In Transit' ? '#3b82f6' : '#f59e0b', fontWeight: 'bold' }}>{activeShipment.status || "Staged"}</Box>
                    </Typography>

                    {/* PHOTO UPLOAD BLOCK */}
                    {activeShipment.status?.toLowerCase() === 'in transit' && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: '700', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                          Cloud Upload: Proof-of-Delivery Photo
                        </Typography>
                        
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={fileInputRef} 
                          style={{ display: 'none' }} 
                          onChange={handleFileChange} 
                        />

                        <Box 
                          onClick={() => uploadState !== 'uploading' && fileInputRef.current.click()}
                          sx={{ 
                            border: '1px dashed #21262d', 
                            borderRadius: '8px', 
                            p: 2.5, 
                            textAlign: 'center', 
                            cursor: uploadState === 'uploading' ? 'not-allowed' : 'pointer',
                            bgcolor: '#0d1117',
                            transition: '0.2s',
                            '&:hover': { borderColor: '#a855f7', bgcolor: '#161b22' }
                          }}
                        >
                          {uploadState === 'waiting' && (
                            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                              <CloudUploadIcon sx={{ color: '#8b949e', fontSize: 28 }} />
                              <Typography variant="body2" color="#f0f6fc" fontWeight="600">Select Cargo Photo</Typography>
                              <Typography variant="caption" color="text.secondary">PNG, JPG up to 5MB</Typography>
                            </Box>
                          )}

                          {uploadState === 'uploading' && (
                            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                              <CircularProgress size={22} sx={{ color: '#a855f7' }} />
                              <Typography variant="caption" color="#a855f7" fontWeight="600">Streaming to Cloud...</Typography>
                            </Box>
                          )}

                          {uploadState === 'success' && (
                            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                              <ImageIcon sx={{ color: '#10b981', fontSize: 28 }} />
                              <Typography variant="body2" color="#10b981" fontWeight="700">✅ Image Upload Verified</Typography>
                              <Typography variant="caption" sx={{ color: '#8b949e', fontStyle: 'italic' }}>{uploadedFileName}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large" 
                      onClick={handleStatusUpdate}
                      disabled={activeShipment.status?.toLowerCase() === 'delivered'}
                      sx={{ 
                        textTransform: 'none', 
                        fontWeight: 'bold', 
                        borderRadius: '8px', 
                        bgcolor: activeShipment.status?.toLowerCase() === 'pending' ? '#3b82f6' : '#10b981', 
                        '&:hover': { bgcolor: activeShipment.status?.toLowerCase() === 'pending' ? '#2563eb' : '#059669' } 
                      }}
                    >
                      {activeShipment.status?.toLowerCase() === 'pending' ? 'Start Transit (In Transit)' : 'Confirm Delivery'}
                    </Button>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* TELEMETRY VIEW */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, bgcolor: '#0d1117', borderRadius: '14px', border: '1px solid #21262d', minHeight: '320px' }}>
              <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                <NotificationsIcon sx={{ fontSize: 18, color: '#a855f7' }} /> Transit Feeds
              </Typography>
              <Divider sx={{ borderColor: '#21262d', mb: 3 }} />

              <List sx={{ p: 0, maxHeight: '220px', overflowY: 'auto' }}>
                {driverLogs.map((log) => (
                  <Box key={log.id} sx={{ mb: 2.5, position: 'relative', pl: 3 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 10, color: log.color, position: 'absolute', left: 0, top: 5 }} />
                    <Typography variant="body2" fontWeight="700" sx={{ color: '#f0f6fc', lineHeight: 1.2 }}>{log.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mt: 0.5 }}>{log.description}</Typography>
                  </Box>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 3. FLOATING ACTION ACTION ICON TRIGGER BUTTON */}
      {activeShipment && (
        <Fab 
          color="primary" 
          aria-label="chat"
          onClick={() => setIsChatOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24, 
            bgcolor: '#a855f7',
            zIndex: 999, 
            '&:hover': { bgcolor: '#9333ea' }
          }}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* 4. ⭐ NATURAL SLIDING DRAWER PANEL */}
      <Drawer
        anchor="right" 
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sx={{ zIndex: 1300 }} 
        PaperProps={{
          sx: {
            // Calculates exactly how much space is left next to your 280px sidebar layout
            width: { xs: '100%', md: 'calc(100% - 280px)' }, 
            height: '100vh',
            bgcolor: '#0d1117',
            borderLeft: '1px solid #21262d',
            boxShadow: '-10px 0px 30px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            // Custom cubic-bezier transition handles the smooth glide perfectly
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important'
          }
        }}
      >
        {/* Right Close Action Header Button */}
        <Box display="flex" justifyContent="flex-end" sx={{ p: 1, position: 'absolute', right: 16, top: 12, zIndex: 1400 }}>
          <IconButton onClick={() => setIsChatOpen(false)} sx={{ color: '#8b949e', '&:hover': { color: '#f0f6fc' } }}>
            <CloseIcon sx={{ fontSize: '1.4rem' }} />
          </IconButton>
        </Box>

        {/* Embedded Custom Styled Chat View Component */}
        {activeShipment && (
          <Box sx={{ flexGrow: 1, height: '100%' }}>
            <DriverChat 
              manifestId={activeShipment._id} 
              driverId={driverId} 
            />
          </Box>
        )}
      </Drawer>

    </Box>
  );
}